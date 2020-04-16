// @flow

import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./App.css";

var needIcon = L.icon({
  iconUrl:
    "https://drive.google.com/uc?export=view&id=11aK61HHCL1TrdFfgt0Y-2hcYc6kiRVnw",
  iconSize: [40, 47],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76],
});

export default class App extends Component {
  state = {
    lat: 51.505,
    lng: -0.09,
    zoom: 13,
  };

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <Map className="map" center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker icon={needIcon} position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </Map>
    );
  }
}
