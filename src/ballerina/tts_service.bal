import ballerina/http;
import ballerina/log;
import ballerina/uuid;

// TTS Service Configuration
configurable string apiKey = ?;

// Voice type definition
type Voice record {
    string id;
    string name;
    string language;
    string gender;
};

// TTS Request type
type TTSRequest record {
    string text;
    string voiceId;
    float speed = 1.0;
    float pitch = 1.0;
    int volume = 80;
};

// TTS Response type
type TTSResponse record {
    string audioUrl;
    string requestId;
    int duration;
    boolean success;
    string? errorMessage = ();
};

// Available voices
final readonly & Voice[] voices = [
    {id: "en-US-1", name: "Emma (US)", language: "English (US)", gender: "Female"},
    {id: "en-US-2", name: "Michael (US)", language: "English (US)", gender: "Male"},
    {id: "en-GB-1", name: "Olivia (UK)", language: "English (UK)", gender: "Female"},
    {id: "en-GB-2", name: "James (UK)", language: "English (UK)", gender: "Male"},
    {id: "fr-FR-1", name: "Sophie (FR)", language: "French", gender: "Female"},
    {id: "es-ES-1", name: "Isabella (ES)", language: "Spanish", gender: "Female"}
];

service /api on new http:Listener(9090) {
    // CORS configuration
    resource function 'default [string... paths](http:Request req) returns http:Response|error {
        http:Response res = new;
        res.addHeader("Access-Control-Allow-Origin", "*");
        res.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        if (req.method == "OPTIONS") {
            return res;
        }
        
        return res;
    }
    
    // Get available voices
    resource function get voices() returns Voice[]|error {
        return voices;
    }
    
    // Generate speech from text
    resource function post synthesize(@http:Payload TTSRequest payload) returns TTSResponse|error {
        log:printInfo("Received TTS request", text = payload.text, voiceId = payload.voiceId);
        
        
        // Validate request
        if (payload.text == "") {
            return error("Text cannot be empty");
        }
        
        boolean voiceExists = false;
        foreach Voice voice in voices {
            if (voice.id == payload.voiceId) {
                voiceExists = true;
                break;
            }
        }
        
        if (!voiceExists) {
            return error("Invalid voice ID");
        }
        
        // Calculate simulated duration based on text length and speed
        int textLength = payload.text.length();
        int estimatedDuration = <int>(textLength * 50 / <int>payload.speed);
        
        string fakeAudioUrl = string `data:audio/mp3;base64,${payload.text}_${payload.voiceId}_${uuid:createType1AsString()}`;
        
        return {
            requestId: uuid:createType1AsString(),
            duration: estimatedDuration,
            success: true,
            audioUrl: fakeAudioUrl
        };
    }
}   
    // Health check endpoint
//     resource function get health() returns record {|string status;|} {
//         return {status: "UP"};
//     }
// }

// function java:uuid() returns string = external;