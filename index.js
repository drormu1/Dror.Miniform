import express from "express";
import helmet from "helmet";
import Handlebars from 'handlebars';
import { engine } from 'express-handlebars';
import morgan from "morgan";
import 'dotenv/config'

import { translate } from './i18n.js';
// import { connect, getForms, createForm, updateForm, csv } from './fileStore.js';
import { connect, getForms, createForm } from './dbStore.js';
import { getAvailableForms, createFormId, toXlsx, logger, timestamp, getLastFormPerCustomerNumber, sendEmail } from "./helpers.js";

async function main(){
    const app = express();
    app.use(helmet());
    app.use(express.static('public', {
        maxAge: 1000 * 60 * 60 * 24
    }));
    app.use(express.json());
    app.engine('handlebars', engine());
    app.set('view engine', 'handlebars');
    app.set('views', './views');
    app.enable('view cache');
    app.use(morgan('tiny'));

    Handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a == b) { return options.fn(this); }
        return options.inverse(this);
    });

    Handlebars.registerHelper('ifnoteq', function (a, b, options) {
        if (a != b) { return options.fn(this); }
        return options.inverse(this);
    });

    const connected = await connect();
    if(connected){
        // app.get(`/admin/:formType`, async (req, res) => {
        //     const availableForms =  await getAvailableForms();
        //     if(availableForms.includes(req.params.formType.toLocaleLowerCase())){
        //         const forms = await getForms(req.params.formType.toLocaleLowerCase());
        //         console.log(forms.length)
        //         res.render('admin/main', { layout: 'admin', availableForms, forms});
        //     }else{
        //         res.render('errors/404', { layout: null });
        //     }
        // });

        // Export to csv
        app.get(`/admin/csv/:form`, async (req, res) => {
            const formName = req.params.form.toLocaleLowerCase();
            const availableForms =  await getAvailableForms();
            if(availableForms.includes(formName)){
                const forms = await getForms(formName);
                const aggregated = getLastFormPerCustomerNumber(forms);
                const now = timestamp();
                const filename = `${now}_${formName}.xlsx`;
                const buffer = await toXlsx(aggregated);
                await sendEmail(process.env.EMAIL_TO_ADDRESSES.split(','), `Volunteer Report`, `<h1>Report</h1><div>Report<div>`, {filename, content:buffer});
                await logger('Email sent');
                res.send('Email sent successfuly!');
            }else{
                res.status(404).send('Form Not found');
            }
        });

        //update form
        // app.post(`/admin`, async (req, res) => {
        //     res.render('admin/main', { layout: 'forms'});
        // })
    
        //Load empty form
        app.get('/:form', async (req, res) => {
            const availableForms =  await getAvailableForms();
            const formName = req.params.form.toLocaleLowerCase();
            if(availableForms.includes(formName)){
                res.render(formName, { layout: 'forms', formName, title: translate(`${formName}_title`)});
            }else{
                res.render('errors/404', { layout: null });
                // res.status(404).send('Not found');
            }
        });

        //Load existing forms, from link admin
        app.get('/:form/:formId', async (req, res) => {
            const formName = req.params.form.toLocaleLowerCase();
            const availableForms =  await getAvailableForms();
            if(availableForms.includes(formName) && req.params.formId){
                const form = await getForms(formName, req.params.formId);
                res.render(formName, { layout: 'forms', ...form[0].Data, title: translate(`${formName}_title`) });
            }else{
                res.status(404).send('Form Not found');
            }
        });

        app.post('/:form', async (req, res) => {
            const formName = req.params.form.toLocaleLowerCase();
            const availableForms =  await getAvailableForms();
            if(availableForms.includes(formName)){
                const formId = createFormId();
                const outcome = await createForm({...req.body, formId});
                res.json({status: outcome ? 'ok' : 'error', formId});
            }else{
                res.status(404).send('Not found');
            }
        });
        
        try{
            app.listen(parseInt(process.env.APP_PORT), () => {
                console.log(`Miniforms app is listening at http://localhost:${process.env.APP_PORT}`);
            });
        }catch(e){
            throw 'Port already in use';
        }
        
    }else{
        console.log('Failed to connect to the DB. Fix it so the app will work');
    }
}

main();