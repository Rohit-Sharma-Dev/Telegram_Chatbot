require('dotenv').config();
const allQuestions = require('./questions')
const {google}= require('googleapis');
const keys = require('./keys.json');
const input = require('prompt-sync')();
const TG = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const bot = new TG(token, { polling: true });



function googleSheet(Name,Right,Wrong){
    const client = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    
    client.authorize((err,tokens)=>{
        if(err){
            console.log(err);
            return;        
        }
        else{
            gsrun(client);
        }
    });


    async function gsrun(cli){
        const gsapi = google.sheets({version:'v4',auth:cli});
    
        const opt = {
    
            spreadsheetId:'1C4x_46meDe_Y7y69SDOSYuG3nt7QiY1oYq9MNcCy1Pg',
            range:'Sheet1'
        }
    
        let data = await gsapi.spreadsheets.values.get(opt)
        let newArray = data.data.values;
        let updated = [...newArray[newArray.length-1]]
        updated[0] = (parseInt(updated[0])+1).toString();
        updated[1]= Name;
        updated[2] = Right;
        updated[3] = Wrong;
        newArray.push(updated);
        
        
    
        const updateOptions = {
            spreadsheetId:'1C4x_46meDe_Y7y69SDOSYuG3nt7QiY1oYq9MNcCy1Pg',
            range:'Sheet1!A1',
            valueInputOption:'USER_ENTERED',
            resource:{values:newArray}
        }
        let res = await gsapi.spreadsheets.values.update(updateOptions);
        
    
    }

}

function question(index) {
    return allQuestions[index];
};


var Right = 0;
var Wrong = 0;
var counter = 0;
var num_of_queries = 0;

bot.onText(/\/startquiz/, (msg) => {
    counter++;
    var questions = question(0);
    let Questions = questions.question;
    let Opt = questions.options;
    bot.sendMessage(msg.chat.id, Questions + '\n' + Opt['1'].toString() + '\n' + Opt['2'].toString() + '\n' + Opt['3'].toString() + '\n' + Opt['4'].toString(), {
        "reply_markup": {
            "keyboard": [
                [Opt['1'].toString()],
                [Opt['2'].toString()],
                [Opt['3'].toString()],
                [Opt['4'].toString()]

            ]
        }
    });
    
});



bot.on('message', async(msg) => {
 
    if(msg.text!="/startquiz" && counter==0){
        bot.sendMessage(msg.chat.id,"invalid input if you want to play /startquiz")     
    }
    
    
    if (counter>0) {
        if(Object.values(allQuestions[num_of_queries].options).includes(parseInt(msg.text))){
            if (num_of_queries < allQuestions.length) {

                const answer = allQuestions[num_of_queries].answer;
    
                if (answer.toString() === msg.text) {
                    num_of_queries++;
                    Right++;
                    await bot.sendMessage(msg.chat.id, "Your answer is correct");
    
                }
                else{
                    num_of_queries++;
                    Wrong++;
                    await bot.sendMessage(msg.chat.id, "wrong");
                    
    
                }
                if(num_of_queries == allQuestions.length){
                    
                    googleSheet(msg.from.first_name+' '+msg.from.last_name,Right,Wrong)
                    num_of_queries = 0;
                    counter = 0;
                    Right = 0;
                    Wrong = 0;
                    setTimeout(()=>{
                        bot.sendMessage(msg.chat.id,"if you want to play again so enter /startquiz", {
                            parse_mode: 'HTML',
                            reply_markup: { remove_keyboard: true },
                        });
                    })   
                }
                else{
    
                    var questions = question(num_of_queries);
    
                    let Questions =  questions.question;
    
                    let Opt =  questions.options;
    
                    bot.sendMessage(msg.chat.id, Questions + '\n' + Opt['1'].toString() + '\n' + Opt['2'].toString() + '\n' + Opt['3'].toString() + '\n' + Opt['4'].toString(), {
                        "reply_markup": {
                            "keyboard": [
                                [Opt['1'].toString()],
                                [Opt['2'].toString()],
                                [Opt['3'].toString()],
                                [Opt['4'].toString()]
                            ]
                        }
                    });
                }
            }

        }else{
          await bot.sendMessage(msg.chat.id,"Invalid input");
            var questions = question(num_of_queries);
    
                    let Questions = questions.question;
    
                    let Opt = questions.options;
    
                    bot.sendMessage(msg.chat.id, Questions + '\n' + Opt['1'].toString() + '\n' + Opt['2'].toString() + '\n' + Opt['3'].toString() + '\n' + Opt['4'].toString(), {
                        "reply_markup": {
                            "keyboard": [
                                [Opt['1'].toString()],
                                [Opt['2'].toString()],
                                [Opt['3'].toString()],
                                [Opt['4'].toString()]
                            ]
                        }
                    });
        }
    }
});