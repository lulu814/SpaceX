import React, {Component} from 'react';
import {feature} from 'topojson-client';
import axios from 'axios';
import { Spin } from "antd";
import {geoKavrayskiy7} from 'd3-geo-projection';
import {geoGraticule, geoPath} from 'd3-geo';
import {select as d3Select} from 'd3-selection';
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import {WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY} from "../constants";

const width = 960;
const height = 600;

class WorldMap extends Component {
    state = {
        isLoading: false,
        isDrawing: false
    }
    refMap = React.createRef();
    refTrack = React.createRef();
    map = null;
    color = d3Scale.scaleOrdinal(schemeCategory10);

    generateMap = (land) => {
        // create map projection using a specific shape
        const projection = geoKavrayskiy7()
            // scale: height => width
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);
        const graticule = geoGraticule();
        // get canvas
        const canvas = d3Select(this.refMap.current)
            .attr("width", width)
            .attr("height", height);

        const canvasTrack = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        let context = canvas.node().getContext("2d");
        let contextTrack = canvasTrack.node().getContext("2d");

        // boarder of the map
        // draw the map
        let path = geoPath()
            .projection(projection)
            .context(context);

        // data <-> map
        land.forEach(ele => {
            context.fillStyle = '#B3DDEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        });
        this.map = {
            projection: projection,
            graticule: graticule,
            context: context,
            contextTrack: contextTrack
        }
    }

    track = data => {
        // check if there has position data
        if (data.length === 0 || !data[0].hasOwnProperty('positions')) {
            throw new Error("no position data");
            return;
        }
        const len = data[0].positions.length;
        const {contextTrack} = this.map;

        let now = new Date();
        let i = 0;

        let timer = setInterval(() => {
            // get current time
            let ct = new Date();
            // get time passed
            let timePassed = i === 0 ? 0 : ct - now;
            // convert to JS time, 加速60倍 (Position数据是每秒一个点，现在每秒显示1分钟的路程)
            let time = new Date(now.getTime() + 60 * timePassed);

            // clear canvas before drawing new points
            contextTrack.clearRect(0, 0, width, height);
            contextTrack.font = "bold 14px sans-serif";
            contextTrack.fillStyle = "#333";
            contextTrack.textAlign = "center";
            contextTrack.fillText(d3TimeFormat(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            data.forEach(sat => {
                const {info, positions} = sat;
                this.drawSat(info, positions[i]);
            });
            i += 60;
        }, 1000)
    }

    componentDidMount() {
        // loading
        axios.get(WORLD_MAP_URL)
            .then(response => {
                const {data} = response;
                // convert the map data to an array => land
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            })
            .catch(e => {
                console.log("err in fetch map data ", e.message);
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // fetch satellite position
        if (prevProps.satData !== this.props.satData) {
            const {
                latitude,
                longitude,
                elevation,
                duration
            } = this.props.observerData;
            const endTime = duration * 60;
            this.setState({
                isLoading: true
            });

            const urls = this.props.satData.map(sat => {
                const {satid} = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            });

            Promise.all(urls)
                .then(res => {
                    const arr = res.map(sat => sat.data);
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    });

                    if (!prevState.isDrawing) {
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones!";
                    }
                })
                .catch(e => {
                    console.log("err in fetch satellite position -> ", e.message);
                });

        }

    }

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlongitude || !satlatitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        // projection 在地图上打点
        const { projection, contextTrack } = this.map;
        const xy = projection([satlongitude, satlatitude]);

        contextTrack.fillStyle = this.color(nameWithNumber);
        contextTrack.beginPath();
        contextTrack.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
        contextTrack.fill();

        contextTrack.font = "bold 11px sans-serif";
        contextTrack.textAlign = "center";
        contextTrack.fillText(nameWithNumber, xy[0], xy[1] + 14);
    };

    render() {
        const { isLoading } = this.state;
        return (
            <div className="map-box">
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large" />
                    </div>
                ) : null}
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
                <div className="hint" />
            </div>
        );
    }
}

export default WorldMap;
