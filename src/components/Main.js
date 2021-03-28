import React, { Component } from "react";
import axios from "axios";
import { Row, Col } from "antd";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";
import { NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY } from "../constants";

class Main extends Component {
    state = {
        satInfo: null,
        settings: null,
        isLoadingList: false
    }
    showNearbySatellite = setting => {
        this.setState({
            settings: setting
        });
        this.fetchSatellite(setting);
    };

    fetchSatellite = setting => {
        const { latitude, longitude, elevation, altitude } = setting;
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        this.setState({
            isLoadingList: true
        });

        axios
            .get(url)
            .then(response => {
                console.log('response data',response.data);
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                });
            })
            .catch(error => {
                console.log("err in fetch satellite -> ", error);
            });
    };

    showMap = selected => {
        this.setState(preState => ({
            ...preState,
            isLoadingMap: true,
            satList: [...selected]
        }));
    };

    render() {
        const { satInfo } = this.state;
        return (
            <Row className="main">
                <Col span={8} className="left-side">
                    <SatSetting onShow={this.showNearbySatellite} />
                    <SatelliteList
                        satInfo={satInfo}
                        isLoad={this.state.isLoadingList}
                        onShowMap={this.showMap}
                    />
                </Col>
                <Col span={16} className="right-side">
                    <WorldMap />
                </Col>
            </Row>
        );
    }
}

export default Main;
