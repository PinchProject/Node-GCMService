/**
 * Author: Ismael Gorissen
 * Date: 10/04/13 17:06
 * Company: PinchProject
 */

var gcm = require('./libs');

var message = new gcm.Message();

message.addRegistrationId('APA91bG72MxiXHCxy-eBWLXvI4OZSIuzlrOOP5MOk0TIWrpnz-UeLCpiP_WVf3ChVVEyGIVXpP6ZPhXPlQUO0Flku4PTzc3b3YxEDPsiWKaKyduR1ddp0CpbZxNzjBGDmqg5gVIFffPOp3tUYVTmtqKgW4RdBXZv7L2_cgDfBm8t9389gr6g0tM');
message.setRegistrationIds([
    'APA91bG72MxiXHCxy-eBWLXvI4OZSIuzlrOOP5MOk0TIWrpnz-UeLCpiP_WVf3ChVVEyGIVXpP6ZPhXPlQUO0Flku4PTzc3b3YxEDPsiWKaKyduR1ddp0CpbZxNzjBGDmqg5gVIFffPOp3tUYVTmtqKgW4RdBXZv7L2_cgDfBm8t9389gr6g0tM',
    'APA91bG81fbJTBq3K5vbSQkujzHoA7uNcSrLixBZG7pSPeUYkKd_Z4kpY2HZ1KgPZyqiBe9i6I6ngvMC1pxvdLrdz56MjbKrMkQAFvckJV9zr2tKHnmlaNzx9N2LgiqbMNXyUgYKSEmICf1ABQ_bWyAs_pjxlPlZLQ'
]);

console.log(message.toJSON());
console.log(message.toString());