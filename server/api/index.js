import { Router } from 'express';
import {call} from '../lib/tropo.js';
require('tropo-webapi-node');

let pending_requests = [];

const pending_request = {
    id: null,
    initiator_phone_number: null,
    event_id: null,
    recipient_id: null,
    response: null
}

export default function() {

	let router = Router();
    let json;

	router.use(function(req, res, next) {
        // do logging
        console.log('Something is happening.');
        req.addListener('data', function(data){
            json = data.toString();
        });
        next();
    });

    router.post('/', function(req, res) {
        req.addListener('end', function(){
            console.log("Creating Tropo");
            let tropo = new TropoWebAPI();
            let response = (JSON.parse(json)).session;
            // Create a new instance of the Session object and give it the JSON delivered from Tropo. 
            let session = response.parameters;

            console.log(`Received request for ID ${response.id}`);

            // Create and populate new request object
            let new_request = new Object(pending_request);
            new_request.id = response.id;
            new_request.initiator_phone_number = session.initiator_phone_number;
            new_request.event_id = session.event_id;
            new_request.recipient_id = session.recipient_id;

            // Push the new request into the pending array
            pending_requests.push(pending_request);

            tropo.call(`${session.recipient_phone_number}`);
            
            tropo.say(`Hey ${session.recipient_name}. You have been invited by ${session.initiator_name} to ${session.message}.`);
    
            // Demonstrates how to use the base Tropo action classes.
            let say = new Say(`Would you like to join in? Press 1 or say yes to join, or say no or press 2 to decline.`);
            let choices = new Choices("yes(1, yes), no(2, no)");
        
            // Action classes can be passes as parameters to TropoWebAPI class methods.
            tropo.ask(choices, 3, false, null, "foo", null, true, say, 5, null);
            tropo.on("continue", null, '/api/answer', true);
            tropo.on("incomplete", null, '/api/noanswer', true);

            res.writeHead(200, {'Content-Type': 'application/json'});   
            res.end(TropoJSON(tropo));
            console.log("Sent Tropo: \n");
            //console.log(TropoJSON(tropo));
        });
    });

    router.route('/answer')

    .post(function(req, res) {
        req.addListener('end', function() {
            let tropo = new TropoWebAPI();

            // Create a new instance of the Session object and give it the JSON delivered from Tropo.
            let result = Result(json);
            let id = result.sessionId;
            console.log(`Searching for ID ${id}`);
            for (let i = 0; i < pending_requests.length; i++) {
                console.log(`Checking ID ${pending_requests[i]}`);
                if (pending_requests[i] == id) {
                    console.log(`Received ${result.value} response for ID ${id}`);
                    pending_requests[i].response = result.value;
                }
            }

            tropo.say("Thank you for you response. Have a great day!");

            res.writeHead(200, {'Content-Type': 'application/json'});   
            res.end(TropoJSON(tropo));
        });
    });

    router.route('/noanswer')

    .post(function(req, res) {
        req.addListener('end', function() {
            let result = Result(json);
            let id = result.sessionId;
            console.log(`Searching for ID ${id}`);
            for (let i = 0; i < pending_requests.length; i++) {
                console.log(`Checking ID ${pending_requests[i]}`);
                if (pending_requests[i] == id) {
                    console.log(`Received ${result.value} response for ID ${id}`);
                    pending_requests[i].response = result.value;
                }
            }

            tropo.say("You have not given a response, so we cannot confirm your interest. Have a great day!");

            res.writeHead(200, {'Content-Type': 'application/json'});   
            res.end(TropoJSON(tropo));
        });
    });

    router.route('/call')

    // Handle new call request
    .post(function(req, res) {

        /*// Create a new instance of the Session object and give it the JSON delivered from Tropo.
        let session = Session(json);

        //call based on json data

        let request = req.body.request;
        request = JSON.parse(request);
        let initiator_name = request.initiator_name;
        let message = request.message;
        let recipients = request.recipients;
        for ()*/
    });

    // Handle update request
    router.route('/update')

    // Handle new call request
    .post(function(req, res) {

        /*// Create a new instance of the Session object and give it the JSON delivered from Tropo.
        let session = Session(json);

        //call based on json data

        let request = req.body.request;
        request = JSON.parse(request);
        let initiator_name = request.initiator_name;
        let message = request.message;
        let recipients = request.recipients;
        for ()*/
    });

    call("Hussain", "4692699928", "1", "1", "Revanth", "19312848422", "Let's go to HackDFW");
    call("Revanth", "19312848422", "2", "2", "Hussain", "4692699928", "Let's go to Six Flags");

    return router;
}