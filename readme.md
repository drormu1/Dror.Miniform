# Mod.MiniForms

Quick solution for simple forms that needs to be annonymous and created very fast.

Dependencies and sophisticated structures slow you down, and even roadblock simple development (Gandalf).

The best solution is to have dead simple solution. Somethimes, no platform is the best platform.

## Features

1. Save json forms to MSSQL or to file system as json files

2. Very simple Bootstrap based html markup with very little sophistication

3. Self validation on field level using html attributes and form level as function

4. Export forms to CSV

5. Admin page

6. Track the progress of the form with status, handledby and handledat fields. These fields are free text.

7. Contain one volunteen form, but can contains infinite amount of forms

8. Each form can have it's own Bootstrap theme

## Start the project

npm run start

## Deployment

1. Configure the .env file correctly

2. Create Nginx reverse proxy to the internal port that the app will run on.

3. Test the app in vs code by running simple get

## TODOS

1. Add are you robot

2. Add secured admin area 

3. More forms and logics

4. Finish the admin site