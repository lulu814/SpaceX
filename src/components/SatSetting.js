import React, {Component} from 'react';
import { Form } from 'antd'

class SatSettingForm extends Component {
    render() {
        return (
            <div>

            </div>
        );
    }
}

const SatSetting = Form.create({ name: "satellite-setting" })(SatSettingForm);

export default SatSetting;
