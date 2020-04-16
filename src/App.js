// @flow

import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "./App.css";

var needIcon = L.icon({
  iconUrl:
    "https://drive.google.com/uc?export=view&id=11aK61HHCL1TrdFfgt0Y-2hcYc6kiRVnw",
  iconSize: [40, 47],
  iconAnchor: [20, 47],
  popupAnchor: [0, -47],
});

export default class App extends Component {
  state = {
    location: {
      lat: -26.0385999,
      lng: 27.6977751,
    },
    haveUsersLocation: false,
    zoom: 2,
  };

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          haveUsersLocation: true,
          zoom: 13,
        });
      },
      () => {
        console.log("uh oh... they did not give us their location");
        fetch("https://ipapi.co/json")
          .then((res) => res.json())
          .then((location) => {
            this.setState({
              location: {
                lat: location.latitude,
                lng: location.longitude,
              },
              haveUsersLocation: true,
              zoom: 13,
            });
          });
      }
    );
  }

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <Map className="map" center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {this.state.haveUsersLocation ? (
          <Marker icon={needIcon} position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        ) : (
          ""
        )}
      </Map>
    );
  }
}
