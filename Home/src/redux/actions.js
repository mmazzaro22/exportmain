export const remove_field = 'remove_field';
export const change_input = 'change_input';

export const on_app_started = 'on_app_started';

export const log_event = 'log_event';

export const init_websocket = 'init_websocket';
export const ws_msg_recieved = 'ws_msg_recieved';
export const ACTION_1 = 'ACTION_1';
export const APPENDAMENITIES = 'APPENDAMENITIES';
export const APPROVEBOOKING = 'APPROVEBOOKING';
export const CHECKUSERPROPERTIES = 'CHECKUSERPROPERTIES';
export const CLOSELOADING = 'CLOSELOADING';
export const CREATEARRAY = 'CREATEARRAY';
export const CREATELISTING = 'CREATELISTING';
export const CREATEPROPERTY = 'CREATEPROPERTY';
export const CURRENTPARTNERLISTINGS = 'CURRENTPARTNERLISTINGS';
export const DELETEBOOKINGS = 'DELETEBOOKINGS';
export const DELETELISTING = 'DELETELISTING';
export const DELETEPHOTO = 'DELETEPHOTO';
export const DELETEPROPERTY = 'DELETEPROPERTY';
export const ESTAMENITYARRAY = 'ESTAMENITYARRAY';
export const FILEUPLOAD = 'FILEUPLOAD';
export const GETALLPROPERTYIMAGES = 'GETALLPROPERTYIMAGES';
export const GETAMENITIES = 'GETAMENITIES';
export const GETBOOKINGS = 'GETBOOKINGS';
export const GETCONVERSATION = 'GETCONVERSATION';
export const GETHELPPOST = 'GETHELPPOST';
export const GETHELPPOSTS = 'GETHELPPOSTS';
export const GETME = 'GETME';
export const GETMESSAGES = 'GETMESSAGES';
export const GETONEBOOKING = 'GETONEBOOKING';
export const GETONEPROPERTYIMAGE = 'GETONEPROPERTYIMAGE';
export const GETORDERTYPES = 'GETORDERTYPES';
export const GETPARTNERSITES = 'GETPARTNERSITES';
export const GETPROFILEPICTURE = 'GETPROFILEPICTURE';
export const GETPROPERTIES = 'GETPROPERTIES';
export const GETPROPERTIESCUSTOM = 'GETPROPERTIESCUSTOM';
export const GETPROPERTY = 'GETPROPERTY';
export const GETPROPERTYLISTINGDATA = 'GETPROPERTYLISTINGDATA';
export const GETPROPERTYLISTINGS = 'GETPROPERTYLISTINGS';
export const GETUSSTATES = 'GETUSSTATES';
export const GETUSERS = 'GETUSERS';
export const GETVISITOR = 'GETVISITOR';
export const GOADDLISTINGS = 'GOADDLISTINGS';
export const GOADDPROPERTY = 'GOADDPROPERTY';
export const GOHOME = 'GOHOME';
export const GOHOSTDASHBOARD = 'GOHOSTDASHBOARD';
export const GOSUPPORT = 'GOSUPPORT';
export const HIGHLIGHTELEMENT = 'HIGHLIGHTELEMENT';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const MAKEDATEUNAVAILABLE = 'MAKEDATEUNAVAILABLE';
export const MARKASREAD = 'MARKASREAD';
export const MODALCLOSEBOOKING = 'MODALCLOSEBOOKING';
export const MODALCLOSELISTING = 'MODALCLOSELISTING';
export const MODALSHOWBOOKING = 'MODALSHOWBOOKING';
export const MODALSHOWLISTING = 'MODALSHOWLISTING';
export const OPENEDITPROPERTY = 'OPENEDITPROPERTY';
export const OPENHELPPOST = 'OPENHELPPOST';
export const OPENPROPERTY = 'OPENPROPERTY';
export const REJECTBOOKINGREQUEST = 'REJECTBOOKINGREQUEST';
export const REQUESTPASSWORDRESET = 'REQUESTPASSWORDRESET';
export const SENDMESSAGE = 'SENDMESSAGE';
export const SETPARTNERSITE = 'SETPARTNERSITE';
export const SETPROPERTY = 'SETPROPERTY';
export const SIGNUP = 'SIGNUP';
export const UPDATEIMAGEFILE = 'UPDATEIMAGEFILE';
export const UPDATELISTING = 'UPDATELISTING';
export const UPDATEPROPERTY = 'UPDATEPROPERTY';
export const UPDATEUSER = 'UPDATEUSER';
export const UPDATEUSEREMAIL = 'UPDATEUSEREMAIL';

export const initWebsocket = (path) => {
    return ({
        type: init_websocket,
        payload: {
            path: path
        },
    })
}

export const removeField = (key, index) => {
	return ({
        type: remove_field,
        payload: {
            key: key,
            index: index,
        },
    })
};

export const changeInput = (key, value) => {
    return ({
        type: change_input,
        payload: {
            name: key,
            value: value,
        },
    })
};

export const runAction = (type, payload) =>  ({ type: type, ...payload });

export const logEvent = (payload) =>  ({ type: log_event, payload });
