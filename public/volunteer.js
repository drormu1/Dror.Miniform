// This funciton runs when clicking submit. It will happen after the general field validation logic done.
function specificValidationLogic(){
    const errors = [];
    const form = readForm();
    if(form.answeredPhone === 'YES'){

        if(form.atHome === 'NO' && !form.tempAddressAndDate){
            errors.push('חובה לציין כתובת עדכנית ועד מתי ישהה שם');
        }

        if(!form.requireEvacuation){
            errors.push('חובה לציין האם האדם מבקש פינוי מיוזמתו');
        }

        if(!form.requireMedication){
            errors.push('חובה לציין האם צריך תרופות או ציוד מתכלה אחר');
        }

        if(!form.requireSocialWorker){
            errors.push('חובה לציין האם יש צורל בעובדת סוציאלית של אגף שיקום');
        }
    }

    return errors.join(', ');
}