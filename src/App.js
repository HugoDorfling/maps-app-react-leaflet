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
import Joi from "joi";
import needIcon from "./red-icon.png";
import solutionIcon from "./blue-icon.png";
import logo from "./ptt-icon.png";
const messageIcon = L.icon({
  iconUrl: needIcon,
  iconSize: [40, 47],
  iconAnchor: [20, 47],
  popupAnchor: [0, -47],
});

const myIcon = L.icon({
  iconUrl: solutionIcon,
  iconSize: [40, 47],
  iconAnchor: [20, 47],
  popupAnchor: [0, -47],
});

const schema = Joi.object().keys({
  name: Joi.string()
    .regex(/^[A-Za-z]{1,100}$/)
    .required(),
  message: Joi.string().min(1).max(500).required(),
});

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/v1/messages"
    : "PRODUCTION-URL-HERE";

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
    sendingMessage: false,
    sentMessage: false,
    messages: [],
  };

  componentDidMount() {
    //fetch all messages:
    fetch(API_URL)
      .then((res) => res.json())
      .then((messages) => {
        const haveSeenLocation = {};

        messages = messages.reduce((all, message) => {
          const key = `${message.latitude.toFixed(
            3
          )} ${message.longitude.toFixed(3)}`;
          if (haveSeenLocation[key]) {
            haveSeenLocation[key].otherMessages =
              haveSeenLocation[key].otherMessages || [];
            haveSeenLocation[key].otherMessages.push(message);
          } else {
            haveSeenLocation[key] = message;
            all.push(message);
          }
          return all;
        }, []);

        this.setState({
          messages,
        });
      });

    // Get users location
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

  formIsValid = () => {
    const userMessage = {
      name: this.state.userMessage.name,
      message: this.state.userMessage.message,
    };

    const result = Joi.validate(userMessage, schema);

    return !result.error && this.state.haveUsersLocation ? true : false;
  };

  formSubmitted = (event) => {
    event.preventDefault();
    console.log(this.state.userMessage);

    if (this.formIsValid()) {
      this.setState({
        sendingMessage: true,
      });

      fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: this.state.userMessage.name,
          message: this.state.userMessage.message,
          latitude: this.state.location.lat,
          longitude: this.state.location.lng,
        }),
      })
        .then((res) => res.json())
        .then((message) => {
          console.log(message);
          setTimeout(() => {
            this.setState({
              sendingMessage: false,
              sentMessage: true,
            });
          }, 1000);
        });
    }
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
        <Map
          className="map"
          center={position}
          zoom={this.state.zoom}
          dragging="true"
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {this.state.haveUsersLocation ? (
            <Marker icon={myIcon} position={position}></Marker>
          ) : (
            ""
          )}
          {this.state.messages.map((message) => (
            <Marker
              key={message._id}
              icon={messageIcon}
              position={[message.latitude, message.longitude]}
            >
              <Popup>
                <p>
                  <em>{message.name}:</em> {message.message}
                </p>
                {message.otherMessages
                  ? message.otherMessages.map((message) => (
                      <p key="message._id">
                        <em>{message.name}:</em> {message.message}
                      </p>
                    ))
                  : ""}
              </Popup>
            </Marker>
          ))}
        </Map>

        <div className="message-form">
          <Card body className="message-card bg-dark">
            <div className="welcome-section">
              <img src={logo} alt="logo" className="logo"></img>
              <div className="welcome-text">
                <h2>Welcome to PostMap!</h2>
                <h5>Developed by Hugo Dorfling</h5>
              </div>
            </div>

            <CardTitle>
              Create a pin on your current location and add a message!
            </CardTitle>
            {!this.state.sendingMessage &&
            !this.state.sentMessage &&
            this.state.haveUsersLocation ? (
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
                <FormText color="muted" className="disclaimer">
                  We
                  <u>
                    <em> do not </em>
                  </u>
                  share your data.
                </FormText>
                <Button
                  type="submit"
                  color="info"
                  disabled={!this.formIsValid()}
                >
                  Create POST
                </Button>
              </Form>
            ) : this.state.sendingMessage || !this.state.haveUsersLocation ? (
              <img
                alt="loading"
                src="https://i.giphy.com/media/8rFvX2jLDn2vkVihUG/giphy.gif"
              />
            ) : (
              <CardText>'Thanks for submitting a message!'</CardText>
            )}
          </Card>
        </div>
      </div>
    );
  }
}

export default App;
