import { authenticator } from "otplib";
import QRCode from "qrcode";
const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore();

const getDoc = async (name:string)=>{
    const document = firestore.doc(name);
    const doc = await document.get();
    if(doc.exists){
        return doc;
    }else{
        return null;
    }
}


const getAuthDoc = async (username:string) =>{
    const doc = await getDoc(`authorization/${username}`)
    return doc;
}

const updateAuthDoc = async (username:string,data:any) =>{
    const document = firestore.doc(`authorization/${username}`);
    await document.update(data);
}



export const login = async (username:string,code:string)=>{
    const doc = await getAuthDoc(username);
    if(!doc){
        return {
            code: 404,
            message: "user_does_not_exists",
            data: null
        }
    }
    const {secret,verified} = doc.data();
    if(!verified){
        return {
            code: 401,
            message: "user_not_verified",
            data: null
        }
    }
    const validated = authenticator.check(code, secret);
    if(!validated){
        return {
            code: 401,
            message: "wrong_code",
            data: null
        }
    }
    return {
        code: 200,
        message: "ok",
        data: null
    }
}

export const register = async (username:string,code:string)=>{
    const doc = await getAuthDoc(username);
    if(!doc){
        return {
            code: 404,
            message: "user_does_not_exists",
            data: null
        }
    }
    const {secret,verified} = doc.data();
    if(verified){
        return {
            code: 400,
            message: "user_already_associated",
            data: null
        }
    }
    const validated = authenticator.check(code, secret);
    if(!validated){
        return {
            code: 401,
            message: "wrong_code",
            data: null
        }
    }
    // --------------------------------------
    // Verfied Updated
    // --------------------------------------
    await updateAuthDoc(username,{
        verified: true,
    })
    // --------------------------------------
    return {
        code: 200,
        message: "ok",
        data: {
            username
        }
    }
}

export const check = async (username:string)=>{
    const doc = await getAuthDoc(username);
    if(!doc){
        return {
            code: 404,
            message: "user_does_not_exists",
            data: null
        }
    }
    const {verified} = doc.data();
    if(verified){
        return {
            code: 400,
            message: "user_already_associated",
            data: {
                username
            }
        }
    }
    return {
        code: 200,
        message: "ok",
        data: {
            username
        }
    }
}


export const preRegister = async (username:string)=>{
    const doc = await getAuthDoc(username);
    if(!doc){
        return {
            code: 404,
            message: "user_does_not_exists",
            data: null
        }
    }
    const {verified} = doc.data();
    if(verified){
        return {
            code: 400,
            message: "user_already_associated",
            data: null
        }
    }
    //
    const secret = authenticator.generateSecret(); // base32 encoded hex secret key
    await updateAuthDoc(username,{
        secret: secret,
        verified: false
    })
    const otpauth = authenticator.keyuri(
        username,
        "ur-attendance",
        secret
    );
    const qrCode = await QRCode.toDataURL(otpauth, {
        errorCorrectionLevel: "H",
        width: 200,
        scale: 10,
        margin: 2,
    });
    return {
        code: 200,
        message: "ok",
        data: {
            secretString: secret,
            secretImageString: qrCode
        }
    }
}