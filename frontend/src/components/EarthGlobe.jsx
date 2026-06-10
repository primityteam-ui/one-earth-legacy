import { useEffect, useRef } from "react";
import {
  Cartesian3,
  Color,
  Ion,
  Math as CesiumMath,
  OpenStreetMapImageryProvider,
  PointGraphics,
  Viewer,
  createWorldTerrainAsync
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const missionColors = {
  "Human Survival": Color.fromCssColorString("#fb7185"),
  "Planet Protection": Color.fromCssColorString("#34d399"),
  "Children & Education": Color.fromCssColorString("#60a5fa"),
  default: Color.fromCssColorString("#facc15")
};

export default function EarthGlobe({
  countries = [],
  selectedCountry,
  onSelectCountry
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) {
      return;
    }

    Ion.defaultAccessToken = "";

    const viewer = new Viewer(containerRef.current, {
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
      shouldAnimate: true,
      imageryProvider: new OpenStreetMapImageryProvider({
        url: "https://tile.openstreetmap.org/"
      })
    });

    viewerRef.current = viewer;

    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.skyAtmosphere.show = true;

    createWorldTerrainAsync()
      .then((terrainProvider) => {
        viewer.terrainProvider = terrainProvider;
      })
      .catch(() => {
        // Terrain can fail without Cesium Ion. Globe will still work.
      });

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(-39.92924832, -5.99804314, 22252252),
      orientation: {
        heading: CesiumMath.toRadians(204.30222202),
        pitch: CesiumMath.toRadians(-35),
        roll: 0
      }
    });

    viewer.clock.onTick.addEventListener(() => {
      viewer.scene.camera.rotate(Cartesian3.UNIT_Z, -0.00035);
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;

    if (!viewer) {
      return;
    }

    viewer.entities.removeAll();

    countries.forEach((country, index) => {
      const lat = Number(country.lat ?? country.latitude ?? 0);
      const lng = Number(country.lng ?? country.longitude ?? 0);
      const mission = country.mission || country.topMission || country.causeCategory;
      const color = missionColors[mission] || missionColors.default;

      const entity = viewer.entities.add({
        name: country.country || "Legacy Country",
        position: Cartesian3.fromDegrees(lng, lat, 90000),
        point: new PointGraphics({
          pixelSize: selectedCountry?.country === country.country ? 18 : 12,
          color,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: 0
        }),
        label: {
          text: country.country || "",
          font: "14px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 3,
          style: 2,
          pixelOffset: { x: 0, y: -28 },
          show: selectedCountry?.country === country.country
        },
        properties: {
          index
        }
      });

      entity.description = `
        <strong>${country.country || "Country"}</strong><br/>
        Mission: ${mission || "Legacy Mission"}<br/>
        Donors: ${country.donors || 0}<br/>
        Donated: $${Number(country.totalDonated || 0).toLocaleString()}
      `;
    });

    viewer.screenSpaceEventHandler.setInputAction((movement) => {
      const pickedObject = viewer.scene.pick(movement.position);

      if (pickedObject?.id?.properties?.index && onSelectCountry) {
        const index = pickedObject.id.properties.index.getValue();
        onSelectCountry(countries[index]);
      }
    }, 2);
  }, [countries, selectedCountry, onSelectCountry]);

  return (
    <div className="relative h-[620px] overflow-hidden rounded-[1.75rem] border border-borderRoyal bg-black">
      <div ref={containerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute bottom-5 left-5 right-5 rounded-2xl border border-borderRoyal bg-black/60 p-4 text-sm text-textSecondary backdrop-blur">
        Real interactive Earth globe with exact latitude/longitude donor points.
      </div>
    </div>
  );
}