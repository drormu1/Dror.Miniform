let fieldValidationState = {};
function init(){
    _tag('input').forEach(elm => {
        elm.addEventListener('blur', validateField);
        const constraints = getElementConstraints(elm.id);
        if(constraints.hasConstraints){
            fieldValidationState[elm.id] = false;
        }
    });

    _tag('textarea').forEach(elm => {
        elm.addEventListener('blur', validateField);
        const constraints = getElementConstraints(elm.id);
        if(constraints.hasConstraints){
            fieldValidationState[elm.id] = false;
        }
    });

    _tag('select').forEach(elm => {
        elm.addEventListener('blur', validateField);
        const constraints = getElementConstraints(elm.id);
        if(constraints.hasConstraints){
            fieldValidationState[elm.id] = false;
        }
    });

    // console.log(fieldValidationState);
    _id('submitButton').addEventListener('click', postForm);
    // _id('clearButton').addEventListener('click', clearForm);
    // _id('newFormButton').addEventListener('click', createNewForm);
}

window.onload = init;

function checkAllFieldsValid(){
    return Object.values(fieldValidationState).every(v => v === true);
}

function validateForm(payload){
    const errors = specificValidationLogic();
    return errors;
}

function validateField(event){
    const errors = [];
    const constraints = getElementConstraints(event.target.id);
    // console.log(constraints);
    if(constraints.hasConstraints){
        if(constraints.required && (!event.target.value || event.target.value.trim() === '')){
            errors.push('שדה חובה');
        }
    
        if(constraints.minLength && event.target.value.length < constraints.minLength){
            errors.push(`אורך מינימלי ${constraints.minLength}`);
        }
        
        if(constraints.maxLength && event.target.value.length > constraints.maxLength){
            errors.push(`אורך מקסימלי ${constraints.maxLength}`);
        }
    
        if(constraints.min && event.target.value < constraints.min){
            errors.push(`ערך מינימלי ${constraints.min}`);
        }
    
        if(constraints.max && event.target.value > constraints.max){
            errors.push(`ערך מקסימלי ${constraints.max}`);
        }
    
        if(constraints.numbersOnly && isNaN(event.target.value)){
            errors.push(`ערך מספרי בלבד`);
        }
    
        //TODO: implement the rest of the constraints  
        console.log(errors);
        
        const elm = _id(event.target.id);
        if(errors.length > 0){
            fieldValidationState[event.target.id] = false;
            elm.classList.remove('is-valid');  
            elm.classList.add('is-invalid');  
            _id(`${event.target.id}-error`).innerHTML = errors.join(', ');
            _id('submitButton').setAttribute('disabled', 'disabled');
        }else{
            fieldValidationState[event.target.id] = true;
            if(checkAllFieldsValid()){
                _id('submitButton').removeAttribute('disabled');
            }
            elm.classList.add('is-valid');
            elm.classList.remove('is-invalid');
            _id(`${event.target.id}-error`).innerHTML = '';
        }
    }
}

function getElementConstraints(id){
    const elm = _id(id);

    const required = !!elm.attributes['data-required'] ? elm.attributes['data-required'].value === 'true' : false;
    const minLength = !!elm.attributes['data-min-length'] ? parseInt(elm.attributes['data-min-length'].value) : null;
    const maxLength = !!elm.attributes['data-max-length'] ? parseInt(elm.attributes['data-max-length'].value) : null;
    const min = !!elm.attributes['data-min'] ? parseInt(elm.attributes['data-min'].value) : null;
    const max = !!elm.attributes['data-max'] ? parseInt(elm.attributes['data-max'].value) : null;
    const isDate = !!elm.attributes['data-date'] ? elm.attributes['data-date'].value === 'true' : false;
    const isTime = !!elm.attributes['data-time'] ? elm.attributes['data-time'].value === 'true' : false;
    const isIdentityNumber = !!elm.attributes['data-identity'] ? elm.attributes['data-identity'].value === 'true' : false;
    const isZipCode = !!elm.attributes['data-zipcode'] ? elm.attributes['data-zipcode'].value === 'true' : false;
    const numbersOnly = !!elm.attributes['data-numbers-only'] ? elm.attributes['data-numbers-only'].value === 'true' : false;

    const hasConstraints = required || minLength || maxLength || min || max || isDate || isTime || isIdentityNumber || isZipCode || numbersOnly;
    return { required, minLength, maxLength, min, max, isDate, isTime, isIdentityNumber, isZipCode, numbersOnly, hasConstraints };
}

async function postForm(){
    const payload = readForm();
    const errors = validateForm(payload);
    // console.log(payload);
    if(!errors && confirm('האם לשלוח את הטופס?')){
        _id('submitButton').setAttribute('disabled', 'disabled');
        const data = await fetch(payload.formType, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(res => res.json());
        if(data.status === 'ok'){
            _id('submitButton').removeAttribute('disabled');
            alert(`טופס נשלח בהצלחה. מספר הטופס הוא ${data.formId}`);
            createNewForm();
        }else{
            alert('שגיאה בשליחת הטופס');
            _id('submitButton').removeAttribute('disabled');
        }
    }else{
        alert(errors);
    }
}

function createNewForm(){
    if(window.confirm('האם ברצונך ליצור טופס חדש?')){
        location.reload();
    }
}

function clearForm(){
    _tag('input').forEach(elm => {
        if(elm.attributes['type'].value !== 'hidden'){
            elm.value = '';
            elm.classList.remove('is-invalid');
            elm.classList.remove('is-valid');
        }
    });

    _tag('textarea').forEach(elm => {
        elm.value = '';
        elm.classList.remove('is-invalid');
        elm.classList.remove('is-valid');
    });

    _tag('select').forEach(elm => {
        elm.children[0].selected = true;
        elm.classList.remove('is-invalid');
        elm.classList.remove('is-valid');
    });
}

function _id(id){
    return document.getElementById(id);
}

function _tag(tag){
    return Array.from(document.getElementsByTagName(tag));
}

function readForm(){
    const res = {};
    Array.from(document.getElementsByTagName('input')).forEach(elm => {
        res[elm.name] = elm.value;
    });

    Array.from(document.getElementsByTagName('select')).forEach(elm => {
        res[elm.name] = elm.value;
    });

    Array.from(document.getElementsByTagName('textarea')).forEach(elm => {
        res[elm.name] = elm.value;
    });

    return res;
}

function collapse(containerId){
    const element = document.querySelector(`#${containerId}`);
    bootstrap.Collapse.getOrCreateInstance(element).toggle();
}

function hide(containerId){
    const element = document.querySelector(`#${containerId}`);
    bootstrap.Collapse.getOrCreateInstance(element).hide();
}

function show(containerId){
    const element = document.querySelector(`#${containerId}`);
    bootstrap.Collapse.getOrCreateInstance(element).show();
}