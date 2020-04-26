import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'a-club';
}
/*
(function(){
  var _log = console.log;
  var _error = console.error;

  console.error = function(errMessage){
      // (errMessage);// Send a mail with the error description
     _error.apply(console,arguments);
  };

  console.log = function(logMessage){
      // Do something with the log message
      _log.apply(console,arguments);
  };
  
})();
*/