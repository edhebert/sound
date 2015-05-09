# Sound Analyzer

Ed Hebert  
Harvard CSCI E-3  
ehebert@fas.harvard.edu

**NOTE** - This app needs to run on a server. Localhost will work, but I also have the app running at http://edhebert.org/sound

Unless run from an SSL connection, the app will ask for the use of your microphone each time it's run. If you want to bypass that annoying user experience, you can also choose to run via a shared SSL at https://siteground138.com/~edhebert/sound/ Since it's a shared certificate, you'll have to manually agree to trust it (overriding the scary warnings).

Note that with a proper SSL certificate matched to the domain, this would not be an issue. On my own locahost install, I created my own self-signed certificate to match the local domain I'm running. This corrects all UX problems.

## Abstract

The Sound Analyzer is an app I created for use in my job. It's designed to capture and measure impact sound events, like a golf club hitting a ball (or something sharp like hand claps or drum hits). 

I'm a golf product designer, and this app was written to assist in my research work in product development. I want to better understand the sound of golf impacts and learn more about their acoustic signature. Sound correlates highly with the subjective golfer perception of 'feel' (i.e., whether a ball product feels good or bad, too hard or too soft). This data will help me better objectify that fuzzy piece of player research.

Built with a combination of vanilla JavaScript, jQuery, P5.JS and AngularJS 

* http://p5js.org
* https://angularjs.org/
* Angular-P5 wrapper code https://github.com/wxactly/angular-p5.js
* Charting of captured data using Highcharts - http://www.highcharts.com/
* UI created with Bootstrap - http://getbootstrap.com/

Angular direction provided by two lynda.com videos
* http://www.lynda.com/AngularJS-tutorials/Up-Running-AngularJS/154414-2.html
* http://www.lynda.com/AngularJS-tutorials/Building-Data-Driven-App-AngularJS/368918-2.html


## Details

Since this is an experiment with using AngularJS, I structured the app according to an MVC format. The bulk of my JavaScript code resides in the js/controllers.js file, particularly in the "SoundController" controller function. There's a loose data model with information being passed to and from views via $scope variables. The 'views' in my Angular MVC are a global layout file that also loads all dependencies for the app (index.html), and a partial html file that does all the drawing and charting. It's at partials/capture.html  

The SoundController code contains the P5JS functionality, and uses the P5.JS structure of a setup() function and a draw() function. This is analagous to the Processing language on which it is based. (http://processing.org) 

The setup() initializes key variables and defines the canvas. The draw() function loops continuously (approx 60fps), and continually refreshes the canvas drawing functions in realtime. 

Note that to keep P5JS out of the global scope and to play nicely with Angular, I had to create an instance of P5 and pass it as 'p' into the function - for more, see http://p5js.org/learn/examples/Instance_Mode_Instantiation.php


## Key Features of the App

* Uses P5.JS to enable and capture audio from the environment via microphone input

* Captures an array of audio data in the time domain (amplitudes over time) and draws that info to the P5's redering of an HTML5 canvas element as a real-time visualization (white line)

* performs a Fast-Fourier transform (FFT) analysis of that same sound information to convert that sound data to an array of frequencies detected in that sound (frequencies vs. amplitudes). It also maps that data visualiztion in real-time to the P5 canvas as the orange line.

* Listens for sound events that cross a certain threshold of loudness/amplitude (that threshold is controlled via an event listener coupled to the input slider in the user interface).

* When app detects a sound event that crosses its threshold, it captures and analyzes that moment in time. This data represents the impact event (of a ball and club in my test case, but could be any other sharp sound like a hand clap or similar). 

* Key elements of the captured data are displayed on a table at the left, and the entire array of data is sent to a custom Highcharts line chart that displays the captured audio frequency data. This chart allows the user to zoom in to highlight details of the event. 

* Likewise, another Highchart bar chart is created that creates a histogram of averages of sound energy in certain interesting buckets of frequency ranges. This chart is easier to digest for a casual user or useful for an executive looking for an 'at a glance' approximation of a ball's sound signature. 

* Both charts have the ability to export data to PDF, image file, CSV, or XLS data. I'm leveraging Highcharts for this capability.

* The buttons on the lower left of the Ananysis view allow the user to either rehit of save the shot. If the user chooses to save the shot, a JSON file is created for archive. Ultimately this data wold be stored to a backend DB once the test is incorporated in production.