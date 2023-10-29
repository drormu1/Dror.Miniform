import { Connection, Request, TYPES } from 'tedious';

import { verbose } from './helpers.js';
import { translate } from './i18n.js';

const config = {
    server: process.env.SQL_HOST_NAME,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.SQL_USERNAME,
            password: process.env.SQL_PASSWORD
        }
    },
    options: {
        database: process.env.SQL_DB_NAME,
        trustServerCertificate: true,
        port: parseInt(process.env.SQL_PORT)
    }
};

let _connection = null
export async function connect(){
    return new Promise((resolve, reject) => {
        if(!_connection){
            _connection = new Connection(config);
            _connection.connect(function(err){
                if(err){
                    console.log(err);
                    resolve(false);
                }
                resolve(true);
            });
        }
    });
}

// https://github.com/tediousjs/tedious/blob/master/examples/minimal.js
export async function getForms(formType, formId = null){
    return new Promise((resolve, reject) => {
        const rows = [];
        const sql = `SELECT  [Data], CreatedAt FROM Forms WHERE FormType=@FormType ${formId ? 'AND Id=@Id' : ''} ORDER BY CreatedAt DESC`;
        console.log(sql)
        const request = new Request(sql, (err, rowCount) => {
          if (err) {
            reject(err);
          }
          verbose('input parameters success!');
          return rowCount;
        });
      
        request.addParameter('FormType', TYPES.NVarChar, formType);
        if(formId){
            request.addParameter('Id', TYPES.NVarChar, formId);
        }
        
        request.on('row', (columns) => {
            const row = {};
            columns.forEach((column) => {
                row[column.metadata.colName] = column.value;
            });
            verbose(row);
            rows.push(row);
        });
        
        request.on('done', (rowCount) => {
            console.log('Done is called!');
        });
        
        request.on('doneInProc', (rowCount, more) => {
            console.log(rowCount + ' rows returned');
            rows.forEach(row => row.Data = JSON.parse(row.Data));
            resolve(rows);
        });
      
        _connection.execSql(request);
    });
}

export async function createForm(payload){
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Forms (Id, FormType, Data, CreatedAt) VALUES (@Id, @FormType, @Data, @CreatedAt)`;
        const request = new Request(sql, (err, rowCount) => {
          if (err) {
            reject(err);
          }
          console.log('rowCount: ', rowCount);
          resolve(rowCount > 0)
        });
      
        // Setting values to the variables. Note: first argument matches name of variable above.
        request.addParameter('Id', TYPES.NVarChar, payload.formId);
        request.addParameter('FormType', TYPES.NVarChar, payload.formType);
        request.addParameter('Data', TYPES.NVarChar, JSON.stringify(payload));
        request.addParameter('CreatedAt', TYPES.DateTime2, new Date());
      
        _connection.execSql(request);
    });
}

export function updateForm(handledBy, handledAt, status){
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Forms SET HandledBy=@HandledBy, HandledAt=@HandledAt, Status=@Status WHERE Id=@Id`;
        const request = new Request(sql, (err, rowCount) => {
          if (err) {
            reject(err);
          }
          console.log('rowCount: ', rowCount);
          resolve(rowCount > 0)
        });
      
        // Setting values to the variables. Note: first argument matches name of variable above.
        request.addParameter('Id', TYPES.NVarChar, payload.formId);
        request.addParameter('Status', TYPES.NVarChar, status);
        request.addParameter('HandledBy', TYPES.NVarChar, handledBy);
        request.addParameter('HandledAt', TYPES.DateTime2, handledAt);
      
        _connection.execSql(request);
    });
}

const delimiter = '\t';
export async function csv(formType){
    const rows = (await getForms(formType))
                        .sort((a, b) => a.CreatedAt > b.CreatedAt ? 1 : -1)
                        .map(row => { 
                            return {
                            ...row, 
                            ...row.Data
                        }
                    }).map(row => {
                        delete row.Data; 
                        return row;
                    });
    
    const fields = Object.keys(rows[0]);
    const labels = fields.map(key => translate(key));
    let csv = labels.join(delimiter) + '\n';
    for(const row of rows){
        csv += fields.map(field => row[field] ? translate(row[field].toString()) : '').join(delimiter) + '\n';
    }
    verbose('csv', csv);
    return csv;
}