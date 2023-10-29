import fs from "fs";
import path from "path";

import { getAvailableForms } from "./helpers.js";

export async function getForms(formType, formId = null){
    try{
        const form = fs.promises.readFile(path.join(process.env.FILE_STORE_PATH, formType, `${formId}.json`));
        if(form){
            return JSON.parse(form);
        }
    }catch(e){
        throw new Error('Failed to get form');
    }
}

export async function createForm(payload){
    const folder = payload.formType;
    if(!folder){
        throw new Error('Missing formType');
    }
    const fileName = `${payload.formId}.json`;
    await fs.promises.writeFile(path.join(process.env.FILE_STORE_PATH, folder, fileName), JSON.stringify({...payload, createdAt: new Date()}));
}

export async function csv(formType){
    try{
        const files = await fs.promises.readdir(path.join(process.env.FILE_STORE_PATH, formType));
        const forms = Promise.all(files.map(async file => {
            fs.promises.readFile(path.join(process.env.FILE_STORE_PATH, formType, file));
        }));
        const sorted = forms.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1);
        const fields = Object.keys(sorted[0]);
        const csv = fields.join(',') + '\n';
        for(const form of sorted){
            csv += fields.map(field => form[field].toString()).join(',') + '\n';
        }
        return csv
    }catch(e){

    }
}

export async function connect(){
    try{
        if(!fs.existsSync(process.env.FILE_STORE_PATH)){
            console.log(`Creating folder ${process.env.FILE_STORE_PATH}`);
            fs.mkdirSync(process.env.FILE_STORE_PATH);
        }
        const forms = await getAvailableForms();
        for(const form of forms){
            if(!fs.existsSync(path.join(process.env.FILE_STORE_PATH, form))){
                console.log(`Creating folder for form ${form}`);
                fs.mkdirSync(path.join(process.env.FILE_STORE_PATH, form));
            }
        }
        return true;
    }catch(e){
        console.log(e);
        return false;
    }
}