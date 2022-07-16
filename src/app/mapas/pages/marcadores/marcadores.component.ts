import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorConColor {
    color: string;
    marker?: mapboxgl.Marker;
    centro?: [number, number];
}

@Component({
    selector: 'app-marcadores',
    templateUrl: './marcadores.component.html',
    styles: [
        `
            .mapa-container {
                width: 100%;
                height: 100%;
            }
            .list-group {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99;
            }
            li {
                cursor: pointer;
            }
        `,
    ],
})
export class MarcadoresComponent implements OnInit, AfterViewInit {
    @ViewChild('mapa') divMapa!: ElementRef;
    mapa!: mapboxgl.Map;
    zoomLevel: number = 15;
    centerMap: [number, number] = [-5.657595412293282, 43.53973840553011]; //longitud, latitud

    // array de marcadores
    marcadores: MarcadorConColor[] = [];

    constructor() {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.mapa = new mapboxgl.Map({
            container: this.divMapa.nativeElement,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: this.centerMap,
            zoom: this.zoomLevel,
        });

        this.leerLocalStorage();

        /** Marcador en el centro, personalizado
    const markerHtml: HTMLElement = document.createElement('div');
    markerHtml.innerHTML = 'hola mundo';

    const marker = new mapboxgl.Marker({ element: markerHtml })
      .setLngLat(this.centerMap)
      .addTo(this.mapa);
    **/
    }

    agregarMarcador() {
        const color = '#xxxxxx'.replace(/x/g, (y) => ((Math.random() * 16) | 0).toString(16));

        const nuevoMarcador = new mapboxgl.Marker({draggable: true, color}).setLngLat(this.centerMap).addTo(this.mapa);

        this.marcadores.push({
            color,
            marker: nuevoMarcador,
        });
        this.guardarMarcadoresLocalStorage();

        nuevoMarcador.on('dragend', (ev) => {
            this.guardarMarcadoresLocalStorage();
        });
    }

    irMarcador(marker: mapboxgl.Marker) {
        this.mapa.flyTo({
            center: marker.getLngLat(),
        });
    }

    //el local storage solo graba strings!!
    guardarMarcadoresLocalStorage() {
        const lngLatArr: MarcadorConColor[] = [];

        this.marcadores.forEach((marcador) => {
            const color = marcador.color;
            const {lng, lat} = marcador.marker!.getLngLat();
            lngLatArr.push({
                color,
                centro: [lng, lat],
            });
        });

        localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
    }

    leerLocalStorage() {
        if (!localStorage.getItem('marcadores')) {
            return;
        }
        const lngLatArr: MarcadorConColor[] = JSON.parse(localStorage.getItem('marcadores')!);

        lngLatArr.forEach((m) => {
            const newMarker = new mapboxgl.Marker({
                color: m.color,
                draggable: true,
            })
                .setLngLat(m.centro!)
                .addTo(this.mapa);

            this.marcadores.push({
                marker: newMarker,
                color: m.color,
            });

            newMarker.on('dragend', (ev) => {
                this.guardarMarcadoresLocalStorage();
            });
        });
    }

    borrarMarcador(ind: number) {
        this.marcadores[ind].marker?.remove();
        this.marcadores.splice(ind, 1);
        this.guardarMarcadoresLocalStorage();
    }
}
