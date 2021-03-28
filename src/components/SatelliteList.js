import React, {Component} from 'react';
import {Button, Spin, List, Avatar, Checkbox} from 'antd';
import satellite from "../assets/images/satellite.svg";

class SatelliteList extends Component {
    state = {
        selected: []
    }

    addOrRemove = (sat, status, list) => {
        // case 1: check is true
        // -> sat not in the list ==> add
        // -> sat is not in the list ==> do nothing

        // case 2: check is false
        // -> sat not in the list ==> do nothing
        // -> sat is in the list ==> remove
        const found = list.some(item => item.satid === sat.satid);
        if (status && !found) {
            list = [...list, sat];
        }

        if (!status && found) {
            list = list.filter(item => {
                return item.satid !== sat.satid;
            });
        }
        console.log('list->', list);
        return list;
    };

    onShowSatMap = () => {
        this.props.onShowMap(this.state.selected);
    };

    onChange = e => {
        // get datainfo and checked from the target list item
        const {dataInfo, checked} = e.target;
        console.log(e.target);

        // add or remove selected satellite to/from the selected array
        const {selected} = this.state;
        const list = this.addOrRemove(dataInfo, checked, selected);

        // setState update the selected list
        this.setState({
            selected: list
        });
    };

    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const {isLoading} = this.props;
        const {selected} = this.state;
        return (
            <div className="sat-list-box">
                <div className="btn-container">
                    <Button className="sat-list-btn" type="primary" size="large"
                            disabled={selected.length === 0}
                            onClick={this.onShowSatMap}>
                        Track on the map
                    </Button>
                </div>
                <hr/>
                {
                    isLoading ? <div className="spin-box">
                        <Spin tip="Loading..." size="large"/>
                    </div> : <List className="sat-list"
                                   itemLayout='horizontal'
                                   dataSource={satList}
                                   renderItem={item => {
                                       // console.log('item ->', item)
                                       return (
                                           <List.Item
                                               actions={[
                                                   <Checkbox dataInfo={item} onChange={this.onChange}/>
                                               ]}
                                           >
                                               <List.Item.Meta
                                                   avatar={<Avatar size={50} src={satellite}/>}
                                                   title={<p>{item.satname}</p>}
                                                   description={`Launch Date: ${item.launchDate}`}
                                               />
                                           </List.Item>
                                       )
                                   }
                                   }
                    />
                }

            </div>
        );
    }
}

export default SatelliteList;
