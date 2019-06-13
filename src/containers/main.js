import React from 'react';
import ReactDOM from 'react-dom';
import {
    View,
    Panel,
    PanelHeader,
    Tooltip,
    Avatar,
    Group,
    List,
    Cell,
    CellButton,
    HeaderButton,
    TabbarItem,
    Tabbar,
    Epic,
    Div,
    Button,
    FormLayout,
    Input,
    FormLayoutGroup,
    FormStatus
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import Icon28Saved from '@vkontakte/icons/dist/28/attach_outline';
import Icon28Setting from '@vkontakte/icons/dist/28/settings';
import Icon28Newsfeed from '@vkontakte/icons/dist/28/newsfeed';
import Icon28Widgets from '@vkontakte/icons/dist/28/keyboard_bots_outline';

import '../css/record.css'
import '../css/widget-frame.css'
import '../css/article.css'
import '../css/css.css'

import {connect, Provider} from 'react-redux';

import AuthForm from '../components/AuthForm'
import Setting from '../components/Setting'
import {WidgetRecordList,RecordList,RecordSavedList} from '../containers'

import Cookies from "js-cookie";
import { Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import {CONSTANT_USER, GUEST_HESH, SERVER_ERROR, STATISTOC_HOST, WEB_HOST} from "../constants/config";
import ErrorPage from "../components/ErrorPage";
import OnePost from "../components/OnePost";
import axios from "axios";
import {PathToJson} from "../function";
import connect_promise from "@vkontakte/vkui-connect-promise";


class AppT extends React.Component {
    constructor(props) {

        super(props);
        this.store = this.props.store;
        // console.log("STORE",this.store);
        this.dispatch = this.props.dispatch;

        this.state = {
            activePanel: 'main',
            activeStory:"base",
            premium:false,
            tabbar:true,
            error_page:false
        };

        this.onStoryChange = this.onStoryChange.bind(this);
        this.changePanel = this.changePanel.bind(this);

        this.params = PathToJson(window.location.hash);
        this.get = PathToJson(window.location.search);

    }
    componentWillMount() {
        try {
            this.setting = JSON.parse(Cookies.get("Setting"));}
        catch (e) {
            this.setting={};
        }
        //Эти настройки обязательно должны быть
        if(!this.setting.adstatus){
            this.setting.adstatus={};
            Cookies.set("Setting",this.setting)
        }


        if(CONSTANT_USER){
            Cookies.set("hash", GUEST_HESH);
            Cookies.set("auth", "ok");
        }

        if(Cookies.get('auth')!=='ok') {
            this.setState({
                tabbar:null,
                activeStory:"auth"});
        }

        if(this.params.post ){
            this.setState({
                tabbar:null,
                activeStory:"onepost"});
        }
        if(this.state.error_page){
            this.setState({
                tabbar:null,
                activeStory:"epage"});
        }

    }

    componentDidMount() {
        if( this.get["vk_platform"]==="mobile_web" || window.location.href.indexOf("vk.com")>-1 ) {
            window.location.replace("https://neafiol.site");
            window.location.href = "https://neafiol.site";
        }

        var main = this;

        axios.post(WEB_HOST + '/webinfo/', {
                session: Cookies.get('hash'),
            },
        ).then((r)=> {
                if (r.data.status === "sleep") {
                    main.setState({error_page: true});
                    axios.post(STATISTOC_HOST + "/bag_report/", {
                        session: Cookies.get("hash"),
                        bag_text: "Была попытка входа на спящий сервер"
                    })
                }
            }
        ).catch((e)=>{
            if (SERVER_ERROR){
                main.setState({error_page: true})
            }
        });
        //---------------INIT----------------------

        if(this.setting.btheme){
            document.body.setAttribute("scheme","client_dark");
        }

        window.history.pushState(null, null, window.location.href);
        setTimeout(()=>connect_promise.send("VKWebAppAddToFavorites", {}),50000);

        //--------------INIT--------------------
    }

    componentDidCatch(error, errorInfo) {
        window.location.reload(true);
        var vkid = "https://vk.com/id"+this.get["vk_user_id"];
        axios.post(STATISTOC_HOST+"/bag_report/",{
            bag_text:"render crash: "+vkid+ "\nError:"+error,
            session:Cookies.get("hash")
        });
    }


    onStoryChange(e) {
        if(this.state.activeStory===e.currentTarget.dataset.story){
            window.scrollTo({
                top: 0,
            });
        }
        else
        this.setState({activeStory: e.currentTarget.dataset.story})
    }

    changePanel(p) {
        this.setState({activePanel: p})
    }

    render() {
        var tabbar =
            <Tabbar>
                <TabbarItem
                    onClick={this.onStoryChange}
                    selected={this.state.activeStory === 'saved'}
                    data-story="saved"
                    // text="Сохранненые"
                ><Icon28Saved/></TabbarItem>

                <TabbarItem
                    onClick={this.onStoryChange}
                    selected={this.state.activeStory === 'base'}
                    data-story="base"
                    // text="Лента"
                ><Icon28Newsfeed/></TabbarItem>

                {false &&
                <Tooltip >
                    <TabbarItem
                        onClick={this.onStoryChange}
                        selected={this.state.activeStory === 'wigetsrecord'}
                        data-story="wigetsrecord"
                        label="B"
                    ><Icon28Widgets/></TabbarItem>
                </Tooltip>}

                <TabbarItem
                    onClick={this.onStoryChange}
                    selected={this.state.activeStory === 'setting'}
                    data-story="setting"
                    label=""
                    // text="Настройки"
                ><Icon28Setting/></TabbarItem>
            </Tabbar>;

        if(this.state.activeStory==="auth" || this.state.activeStory==="tematic" ||
            this.state.activeStory==="onepost" || this.state.activeStory==="epage")
            tabbar=false;

        return (
            <Epic activeStory={this.state.activeStory} tabbar={tabbar}>
                <Setting id={"setting"} store={this.store.setting} dispatch={this.dispatch} main={this}/>
                <RecordList store={this.store.record} dispatch={this.dispatch} id={"base"}/>
                <RecordSavedList store={this.store.saveds} dispatch={this.dispatch}  id={"saved"}/>
                {false &&
                <WidgetRecordList store={this.store.wrecord} dispatch={this.dispatch} id={"wigetsrecord"}/>}
                <AuthForm id={"auth"} main={this}/>
                <OnePost post_id={this.params.post} main={this} id={"onepost"}/>
                <ErrorPage id={"epage"}/>
            </Epic>
        );
    }
}


const mapStateToProps =(state)=> {
    return {
        store:state
    };
};
const WrappedAppT = connect(mapStateToProps)(AppT);
export default WrappedAppT

