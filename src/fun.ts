const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore();

export const getDoc = async (name:string)=>{
    const document = firestore.doc(name);
    const doc = await document.get();
    if(doc.exists){
        return doc;
    }else{
        return null;
    }
}