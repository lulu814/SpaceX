import React, {Component} from 'react';
import {Row, Col} from 'antd';
import SatSetting from "./SatSetting";

class Main extends Component {
    render() {
        return (
            <Row className="main">
                <Col span={8}>
                    <SatSetting />
                </Col>

                <Col span={16}> right </Col>
            </Row>
        );
    }
}

export default Main;
