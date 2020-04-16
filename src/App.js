// @flow
import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Card,
  Button,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
} from "reactstrap";
import "./App.css";

var needIcon = L.icon({
  iconUrl:
    "https://drive.google.com/uc?export=view&id=11aK61HHCL1TrdFfgt0Y-2hcYc6kiRVnw",
  iconSize: [40, 47],
  iconAnchor: [20, 47],
  popupAnchor: [0, -47],
});

class App extends Component {
  state = {
    location: {
      lat: -26.0385999,
      lng: 27.6977751,
    },
    haveUsersLocation: false,
    zoom: 2,
    userMessage: {
      name: "",
      message: "",
    },
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

  formSubmitted = (event) => {
    event.preventDefault();
    console.log(this.state.userMessage);
  };

  valueChanged = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      userMessage: {
        ...prevState.userMessage,
        [name]: value,
      },
    }));
  };

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <div className="map">
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
          <div className="message-form">
            <Card body>
              <h2>Welcome to PingTheThing!</h2>
              <CardTitle>
                Create a pin on your current location or a specified location.
              </CardTitle>
              <CardText>
                Create a Need, Solution, Vibe or Data pin now!
              </CardText>
              <Form onSubmit={this.formSubmitted}>
                <FormGroup>
                  <Label for="name">Name:</Label>
                  <Input
                    onChange={this.valueChanged}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your name"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="message">Message:</Label>
                  <Input
                    onChange={this.valueChanged}
                    type="textarea"
                    name="message"
                    id="message"
                    placeholder="Enter a message"
                    required
                  />
                </FormGroup>
                <FormText color="muted">By submitting you agree,</FormText>
                <Button
                  type="submit"
                  color="info"
                  disabled={!this.state.haveUsersLocation}
                >
                  Create Ping
                </Button>
              </Form>
            </Card>
          </div>
        </Map>
      </div>
    );
  }
}

export default App;
