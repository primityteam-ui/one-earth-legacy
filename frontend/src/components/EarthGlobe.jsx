import { useEffect, useRef, useState } from "react";
import {
  Viewer,
  Cartesian3,
  Cartographic,
  Color,
  EllipsoidTerrainProvider,
  ArcGisMapServerImageryProvider,
  ArcGisBaseMapType,
  ImageryLayer,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
  LabelStyle,
  Ion,
  Math as CesiumMath,
  NearFarScalar,
  DistanceDisplayCondition,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const missionColors = {
  "Human Survival": "#fb7185",
  "Planet Protection": "#34d399",
  "Children & Education": "#60a5fa",
  default: "#facc15",
};

const countryCoordinates = {
  "United States": { lat: 37.0902, lng: -95.7129 },
  USA: { lat: 37.0902, lng: -95.7129 },
  India: { lat: 20.5937, lng: 78.9629 },
  Brazil: { lat: -14.235, lng: -51.9253 },
  Kenya: { lat: -0.0236, lng: 37.9062 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  Canada: { lat: 56.1304, lng: -106.3468 },
  Mexico: { lat: 23.6345, lng: -102.5528 },
  "United Kingdom": { lat: 55.3781, lng: -3.436 },
  Germany: { lat: 51.1657, lng: 10.4515 },
  France: { lat: 46.2276, lng: 2.2137 },
  Italy: { lat: 41.8719, lng: 12.5674 },
  Spain: { lat: 40.4637, lng: -3.7492 },
  China: { lat: 35.8617, lng: 104.1954 },
  Japan: { lat: 36.2048, lng: 138.2529 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  "South Africa": { lat: -30.5595, lng: 22.9375 },
  Nigeria: { lat: 9.082, lng: 8.6753 },
  Egypt: { lat: 26.8206, lng: 30.8025 },
  UAE: { lat: 23.4241, lng: 53.8478 },
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478 },
};

const fallbackCountries = [
  {
    country: "United States",
    lat: 37.0902,
    lng: -95.7129,
    totalAmount: 1250,
    donorCount: 18,
    mission: "Human Survival",
  },
  {
    country: "India",
    lat: 20.5937,
    lng: 78.9629,
    totalAmount: 980,
    donorCount: 24,
    mission: "Children & Education",
  },
  {
    country: "Brazil",
    lat: -14.235,
    lng: -51.9253,
    totalAmount: 720,
    donorCount: 11,
    mission: "Planet Protection",
  },
  {
    country: "Kenya",
    lat: -0.0236,
    lng: 37.9062,
    totalAmount: 540,
    donorCount: 9,
    mission: "Human Survival",
  },
  {
    country: "Australia",
    lat: -25.2744,
    lng: 133.7751,
    totalAmount: 460,
    donorCount: 7,
    mission: "Planet Protection",
  },
];

function getMissionColor(mission) {
  return missionColors[mission] || missionColors.default;
}

function getCountryCoordinates(countryName) {
  return countryCoordinates[countryName] || null;
}

function normalizeCountryData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return fallbackCountries;
  }

  const normalized = data
    .map((item, index) => {
      const countryName =
        item.country || item.name || item._id || `Country ${index + 1}`;

      const city = String(item.city || "").trim();
      const region = String(item.region || "").trim();

      const locationLabel =
        item.locationLabel ||
        [city, region, countryName].filter(Boolean).join(", ") ||
        countryName;

      const displayLabel = city || countryName;

      const savedCoordinates = getCountryCoordinates(countryName);

      const lat = Number(item.lat || item.latitude || savedCoordinates?.lat);
      const lng = Number(item.lng || item.longitude || savedCoordinates?.lng);

      return {
        country: countryName,
        city,
        region,
        locationLabel,
        displayLabel,
        precision: item.precision || (city ? "city" : "country"),
        lat,
        lng,
        totalAmount: Number(
          item.totalAmount || item.totalDonations || item.amount || 0
        ),
        donorCount: Number(
          item.donorCount || item.totalDonors || item.donors || item.count || 0
        ),
        mission:
          item.mission ||
          item.causeCategory ||
          item.topMission ||
          item.cause ||
          "default",
      };
    })
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

  return normalized.length > 0 ? normalized : fallbackCountries;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function formatAltitude(meters) {
  if (!Number.isFinite(meters)) return "0 km";
  return `${Math.round(meters / 1000).toLocaleString()} km`;
}

export default function EarthGlobe() {
  const cesiumContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const creditContainerRef = useRef(null);

  const [countries, setCountries] = useState(fallbackCountries);
  const [selectedCountry, setSelectedCountry] = useState(fallbackCountries[0]);
  const [statusMessage, setStatusMessage] = useState(
    "Loading Google Earth style globe..."
  );
  const [cameraPosition, setCameraPosition] = useState({
    lat: 0,
    lng: 0,
    altitude: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadCountryData() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/public/leaderboard/countries`
        );

        if (!response.ok) {
          throw new Error("Backend country API failed");
        }

        const result = await response.json();
        const normalized = normalizeCountryData(result?.data || result);

        if (isMounted) {
          setCountries(normalized);
          setSelectedCountry(normalized[0]);
          setStatusMessage("Live One Earth Legacy country data loaded");
        }
      } catch (error) {
        if (isMounted) {
          setCountries(fallbackCountries);
          setSelectedCountry(fallbackCountries[0]);
          setStatusMessage(
            "Showing sample countries because backend country data is not available"
          );
        }
      }
    }

    loadCountryData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cesiumContainerRef.current || viewerRef.current) return;

    Ion.defaultAccessToken = "";

    const hiddenCreditContainer = document.createElement("div");
    hiddenCreditContainer.style.display = "none";
    document.body.appendChild(hiddenCreditContainer);
    creditContainerRef.current = hiddenCreditContainer;

    const satelliteBaseLayer = ImageryLayer.fromProviderAsync(
      ArcGisMapServerImageryProvider.fromBasemapType(
        ArcGisBaseMapType.SATELLITE
      )
    );

    const viewer = new Viewer(cesiumContainerRef.current, {
      baseLayer: satelliteBaseLayer,
      terrainProvider: new EllipsoidTerrainProvider(),
      creditContainer: hiddenCreditContainer,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      infoBox: false,
      selectionIndicator: false,
      shadows: false,
      shouldAnimate: true,
      requestRenderMode: false,
    });

    viewerRef.current = viewer;

    viewer.scene.globe.show = true;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.baseColor = Color.BLACK;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.backgroundColor = Color.BLACK;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.fog.enabled = false;
    viewer.scene.sun.show = true;
    viewer.scene.moon.show = false;
    viewer.scene.highDynamicRange = true;
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

    function updateCameraPosition() {
      const cartographic = Cartographic.fromCartesian(viewer.camera.position);

      setCameraPosition({
        lat: CesiumMath.toDegrees(cartographic.latitude),
        lng: CesiumMath.toDegrees(cartographic.longitude),
        altitude: cartographic.height,
      });
    }

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(78, 15, 9500000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
    });

    updateCameraPosition();
    setStatusMessage("Live One Earth Legacy country data loaded");

    viewer.camera.changed.addEventListener(updateCameraPosition);

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement) => {
      const pickedObject = viewer.scene.pick(movement.position);

      if (pickedObject?.id?.properties?.countryData) {
        const countryData = pickedObject.id.properties.countryData.getValue();
        setSelectedCountry(countryData);

        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            countryData.lng,
            countryData.lat,
            2600000
          ),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-90),
            roll: 0,
          },
          duration: 1.4,
          complete: updateCameraPosition,
        });
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      viewer.camera.changed.removeEventListener(updateCameraPosition);

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }

      if (creditContainerRef.current) {
        creditContainerRef.current.remove();
        creditContainerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.entities.removeAll();

    countries.forEach((country) => {
      const color = Color.fromCssColorString(getMissionColor(country.mission));
      const pointSize = Math.min(25, Math.max(11, country.donorCount + 7));

      viewer.entities.add({
        position: Cartesian3.fromDegrees(country.lng, country.lat, 260000),
        point: {
          pixelSize: pointSize,
          color,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(1800000, 1.35, 14000000, 0.7),
          translucencyByDistance: new NearFarScalar(
            1800000,
            1,
            14000000,
            0.85
          ),
          distanceDisplayCondition: new DistanceDisplayCondition(0, 15000000),
        },
        label: {
          text: country.displayLabel || country.country,
          font: "15px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: { x: 0, y: -23 },
          scaleByDistance: new NearFarScalar(1800000, 1.05, 14000000, 0.62),
          translucencyByDistance: new NearFarScalar(
            1800000,
            1,
            14000000,
            0.75
          ),
          distanceDisplayCondition: new DistanceDisplayCondition(0, 15000000),
        },
        properties: {
          countryData: country,
        },
      });
    });
  }, [countries]);

  function resetEarthView() {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(78, 15, 9500000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
      duration: 1.2,
    });
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
      <style>
        {`
          .cesium-widget-credits,
          .cesium-credit-logoContainer,
          .cesium-credit-textContainer,
          .cesium-credit-expand-link,
          .cesium-credit-lightbox-overlay,
          .cesium-credit-lightbox {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          .cesium-viewer,
          .cesium-viewer-cesiumWidgetContainer,
          .cesium-widget,
          .cesium-widget canvas {
            width: 100% !important;
            height: 100% !important;
          }
        `}
      </style>

      <div className="relative min-h-[760px] bg-black lg:min-h-[820px] xl:min-h-[860px]">
        <div
          ref={cesiumContainerRef}
          className="absolute inset-0 h-full w-full"
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_54%,rgba(0,0,0,0.08)_70%,rgba(0,0,0,0.74)_100%)]" />

        <div className="pointer-events-none absolute left-6 top-6 max-w-sm rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-white backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
            One Earth Legacy
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Live Satellite Earth</h2>
          <p className="mt-1 text-sm text-white/70">
            Google Earth style 3D globe with live One Earth Legacy country data.
          </p>
        </div>

        <div className="pointer-events-none absolute right-6 top-6 w-[280px] rounded-2xl border border-white/10 bg-black/55 p-4 text-white backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
            Selected location
          </p>

          <div className="mt-3 flex items-start gap-3">
            <span
              className="mt-1 h-4 w-4 rounded-full"
              style={{
                backgroundColor: getMissionColor(selectedCountry?.mission),
                boxShadow: `0 0 18px ${getMissionColor(
                  selectedCountry?.mission
                )}`,
              }}
            />

            <div>
              <h3 className="text-xl font-bold">
                {selectedCountry?.locationLabel || selectedCountry?.country || "Earth"}
              </h3>
              <p className="mt-1 text-xs text-white/60">
                Lat {Number(selectedCountry?.lat || 0).toFixed(2)}, Lng{" "}
                {Number(selectedCountry?.lng || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/50">Donors</p>
              <p className="mt-1 font-bold">{formatNumber(selectedCountry?.donorCount)}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/50">Donated</p>
              <p className="mt-1 font-bold">{formatMoney(selectedCountry?.totalAmount)}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/50">Precision</p>
              <p className="mt-1 font-bold capitalize">{selectedCountry?.precision || "country"}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-white/50">Country</p>
              <p className="mt-1 font-bold">{selectedCountry?.country || "Earth"}</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-xs text-white/75 backdrop-blur-md">
          <p className="font-semibold text-white">Live camera</p>
          <p className="mt-1">
            Lat {cameraPosition.lat.toFixed(3)} · Lng{" "}
            {cameraPosition.lng.toFixed(3)} · Alt{" "}
            {formatAltitude(cameraPosition.altitude)}
          </p>
        </div>

        <button
          type="button"
          onClick={resetEarthView}
          className="absolute bottom-6 right-6 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
        >
          Reset Full Globe View
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
          {statusMessage}
        </div>
      </div>
    </section>
  );
}