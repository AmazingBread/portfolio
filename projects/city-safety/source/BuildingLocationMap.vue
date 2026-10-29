<template>
    <div class="location-map-wrap">
        <div ref="mapContainer" class="location-map" :aria-label="buildingName + ' 위치 지도'"></div>
        <span v-if="!validCoordinates" class="location-note">{{ buildingName }} 위치 등록 대기</span>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'proj4';
import 'proj4leaflet';

export default {
    name: 'BuildingLocationMap',
    props: {
        buildingName: { type: String, required: true },
        coordinates: { type: Array, default: null },
        locations: { type: Array, default: () => [] }
    },
    computed: {
        validCoordinates() {
            return this.coordinates && this.coordinates.length === 2 &&
                this.coordinates.every(Number.isFinite) &&
                Math.abs(this.coordinates[0]) <= 90 && Math.abs(this.coordinates[1]) <= 180;
        }
    },
    watch: {
        coordinates: { deep: true, handler() { this.updateLocation(); } },
        locations: { deep: true, handler() { this.updateLocation(); } },
        buildingName() { this.updateLocation(); }
    },
    mounted() {
        // MapView와 동일한 한국 좌표계 및 카카오 일반지도 타일 설정.
        const crs = new L.Proj.CRS('EPSG:5181',
            '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', {
                resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, .5, .25],
                origin: [-30000, -60000],
                bounds: L.bounds([-30000 - Math.pow(2, 19) * 4, -60000], [-30000 + Math.pow(2, 19) * 5, -60000 + Math.pow(2, 19) * 5])
            });
        // Vuex의 본 지도 객체와 분리해 지도 간 간섭을 방지한다.
        this.locationMap = L.map(this.$refs.mapContainer, {
            crs, center: [35.1796, 129.0756], zoom: 8, minZoom: 0, maxZoom: 13,
            zoomControl: false, scrollWheelZoom: true, attributionControl: true
        });
        L.tileLayer('https://map{s}.daumcdn.net/map_2d/2306uwn/L{z}/{y}/{x}.png', {
            crs, subdomains: '0123', zoomReverse: true, zoomOffset: 1,
            tms: true, minZoom: 0, maxZoom: 13, attribution: '© Kakao'
        }).addTo(this.locationMap);
        this.updateLocation();
        this.resizeObserver = new ResizeObserver(() => {
            if (this.locationMap) this.locationMap.invalidateSize({ pan: false });
        });
        this.resizeObserver.observe(this.$refs.mapContainer);
    },
    beforeDestroy() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this.locationMap) this.locationMap.remove();
        this.locationMap = null;
    },
    methods: {
        updateLocation() {
            if (!this.locationMap) return;
            if (this.locationMarker) {
                this.locationMap.removeLayer(this.locationMarker);
                this.locationMarker = null;
            }
            if (!this.validCoordinates) {
                this.locationMap.setView([35.1796, 129.0756], 8);
                return;
            }
            const selectedLocations = this.locations.filter(location => location.name === this.buildingName);
            const locations = selectedLocations.length ? selectedLocations : [{ name: this.buildingName, coordinates: this.coordinates }];
            this.locationMarker = L.layerGroup().addTo(this.locationMap);
            locations.forEach(location => {
                const pink = location.name === '청풍장';
                const color = pink ? '#e50087' : '#087bff';
                const icon = L.divIcon({
                    className: 'building-map-pin', iconSize: [26, 34], iconAnchor: [13, 34],
                    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg"><path d="M13 33C10 27 1 19 1 13a12 12 0 0 1 24 0c0 6-9 14-12 20Z" fill="${color}" stroke="white" stroke-width="2"/><circle cx="13" cy="13" r="4" fill="white"/></svg>`
                });
                const marker = L.marker(location.coordinates, { icon, zIndexOffset: location.name === this.buildingName ? 100 : 0 }).addTo(this.locationMarker);
                const label = document.createElement('span');
                label.textContent = location.name;
                marker.bindTooltip(label, {
                    permanent: true, direction: 'top',
                    offset: [0, -35], opacity: 1,
                    className: 'building-name-label ' + (pink ? 'building-label-pink' : 'building-label-blue')
                });
            });
            this.locationMap.fitBounds(L.latLngBounds(locations.map(location => location.coordinates)), {
                paddingTopLeft: [45, 55], paddingBottomRight: [75, 30], maxZoom: 12
            });
        }
    }
};
</script>

<style scoped>
.location-map-wrap { position: relative; flex: 1; min-height: 0; overflow: hidden; border-radius: 7px; }
.location-map { width: 100%; height: 100%; min-height: 0; background: #edf4fc; }
.location-note { position: absolute; z-index: 500; bottom: 5px; left: 5px; max-width: calc(100% - 20px); padding: 5px 8px; border-radius: 5px; background: rgba(255, 255, 255, .93); color: #506589; font-size: 12px; pointer-events: none; }
.location-map-wrap ::v-deep .building-map-pin { background: transparent; border: 0; }
.location-map-wrap ::v-deep .building-name-label { border: 1px solid #fff; border-radius: 6px; padding: 4px 10px; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 1px 4px #17335630; }
.location-map-wrap ::v-deep .building-label-blue { background: #087bff; }
.location-map-wrap ::v-deep .building-label-pink { background: #e50087; }
.location-map-wrap ::v-deep .building-label-blue.leaflet-tooltip-top::before { border-top-color: #087bff; }
.location-map-wrap ::v-deep .building-label-pink.leaflet-tooltip-top::before { border-top-color: #e50087; }
</style>
