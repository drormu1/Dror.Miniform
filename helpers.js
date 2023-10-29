import fs from "fs";
import { v4 } from 'uuid';
import xlsx from 'node-xlsx';
import nodemailer from 'nodemailer';
import path from 'path';

import { translate } from './i18n.js';

export function createFormId(){
    return v4().replace(/-/g, '');
}

export async function getAvailableForms(){
    const files = (await fs.promises.readdir('./views')).filter(file => file.endsWith('.handlebars'));
    return files.map(file => file.replace('.handlebars', ''));
}

export function verbose(message){
    if(process.env.NODE_ENV === 'development'){
        console.log(message);
    }
}

// export function groupBy(orederedList, key){
//     const res = {};
//     orederedList.forEach(item => {
//         if(!res[item[key]]){
//             res[item[key]] = [];
//         }
//         res[item[key]].push(item);
//     });
// }

export function getLastFormPerCustomerNumber(rows){
    const res = {};
    for(const row of rows){
        if (row.Data.customerNumber in res){
            continue;
        }else{
            res[row.Data.customerNumber] = {...row, ...row.Data};
            delete res[row.Data.customerNumber].Data;
        }
    }
    console.log(res);
    return Object.values(res);
}

export function toCsv(rows, delimiter = '\t'){
    const fields = Object.keys(rows[0]);
    const labels = fields.map(key => translate(key));
    let csv = labels.join(delimiter) + '\n';
    for(const row of rows){
        csv += fields.map(field => row[field] ? translate(row[field].toString()) : '').join(delimiter) + '\n';
    }
    return csv;
}

export async function toXlsx(data, outputPath = null){
    const rows = [];

    const fields = Object.keys(data[0]);
    const labels = fields.map(key => translate(key));

    rows.push(labels);
    for(const dataItem of data){
        const row = [];
        for(const field of fields){
            row.push(dataItem[field]);
        }
        rows.push(row);
    }

    const sheetOptions = {'!cols': [{wch: 6}, {wch: 7}, {wch: 10}, {wch: 20}]};
    const buffer = xlsx.build([{name: 'טופס', data: rows}], {sheetOptions}); // Returns a buffer

    if(outputPath){
        await fs.promises.writeFile(outputPath, buffer);
    }
    return buffer;
}

export function pad(str, length = 2, padWith = '0'){
    return str.toString().padStart(length, padWith);
}

export function time(d, seperator = ':'){
    return [
        pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds())
    ].join(seperator);
}

export function date(d, seperator = '-'){
    return [
        pad(d.getFullYear()),
        pad(d.getMonth() + 1),
        pad(d.getDate())
    ].join(seperator);
}

export function timestamp(seperator = '-'){
    const d = new Date();
    return `${date(d)}_${time(d,'-')}`;
}

export async function logger(message){
    try{
        const d = new Date();
        await fs.promises.appendFile(process.env.LOG_FILE, `[${date(d)} ${time(d)}] ${message}\n`,);
    }catch(e){
        console.log(e);
    }
}

export async function sendEmail(toAddresses, subject, html, attachments){
    // if(process.env.MCFORM_SERVER_ENVIRONMENT === 'DEV'){ //no access from dev server to smtp server
    //     console.log('Skipping email...');
    //     return true;
    // }
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, // 'mailex.mod.gov.il',
            port: parseInt(process.env.EMAIL_PORT), //25,
            secureConnection: false,
            secure: false,
            requiresAuth: false,
            tls: {
                rejectUnauthorized: false
            }
        });
    
        let message = {
            from: process.env.EMAIL_FROM_ADDRESS,
            to: toAddresses,
            subject: subject,
            html: html,
            attachments
        };
        const res = await transporter.sendMail(message);
        return res.messageId && res.messageId.length > 0;
    }catch(e){
        console.log(`EMAIL ERROR: ${e.message}`);
    }
}
