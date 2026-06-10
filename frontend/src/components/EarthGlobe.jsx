import { useEffect, useRef } from "react";
import {
  ArcGisMapServerImageryProvider,
  Cartesian3,
  Color,
  Ion,
  Math as CesiumMath,
  PointGraphics,
  ScreenSpaceEventType,
  Viewer
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
  const rotationListenerRef = useRef(null);

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
      terrainProvider: undefined
    });

    viewerRef.current = viewer;

    viewer.scene.globe.baseColor = Color.fromCssColorString("#102a43");
    viewer.scene.globe.enableLighting = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.backgroundColor = Color.BLACK;

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(-39.92924832, -5.99804314, 22252252),
      orientation: {
        heading: CesiumMath.toRadians(204.30222202),
        pitch: CesiumMath.toRadians(-35),
        roll: 0
      }
    });

    ArcGisMapServerImageryProvider.fromUrl(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    )
      .then((imageryProvider) => {
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imageryProvider);
      })
      .catch((error) => {
        console.error("Could not load satellite imagery", error);
      });

    rotationListenerRef.current = viewer.clock.onTick.addEventListener(() => {
      viewer.scene.camera.rotate(Cartesian3.UNIT_Z, -0.00022);
    });

    return () => {
      if (rotationListenerRef.current) {
        rotationListenerRef.current();
      }

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

      viewer.entities.add({
        name: country.country || "Legacy Country",
        position: Cartesian3.fromDegrees(lng, lat, 120000),
        point: new PointGraphics({
          pixelSize: selectedCountry?.country === country.country ? 20 : 14,
          color,
          outlineColor: Color.WHITE,
          outlineWidth: 2
        }),
        label: {
          text: selectedCountry?.country === country.country ? country.country || "" : "",
          font: "14px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 3,
          style: 2,
          pixelOffset: {
            x: 0,
            y: -30
          },
          showBackground: true,
          backgroundColor: Color.BLACK.withAlpha(0.55)
        },
        properties: {
          index
        }
      });
    });

    viewer.screenSpaceEventHandler.setInputAction((movement) => {
      const pickedObject = viewer.scene.pick(movement.position);

      if (
        pickedObject?.id?.properties?.index !== undefined &&
        onSelectCountry
      ) {
        const index = pickedObject.id.properties.index.getValue();
        onSelectCountry(countries[index]);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }, [countries, selectedCountry, onSelectCountry]);

  return (
    <div className="relative h-[620px] overflow-hidden rounded-[1.75rem] border border-borderRoyal bg-black">
      <div ref={containerRef} className="h-full w-full" />

      <div className="pointer-events-none absolute bottom-5 left-5 right-5 rounded-2xl border border-borderRoyal bg-black/70 p-4 text-sm text-textSecondary backdrop-blur">
        Real interactive Earth globe with exact latitude/longitude donor points.
      </div>
    </div>
  );
}