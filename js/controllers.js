/* Audio Analysis Software 
 *
 * Written as a Final Project for Harvard CSCI-E3
 * Ed Hebert
 * May 2015
 * ehebert@fas.harvard edu
 *
 * This code makes use of AngularJS, P5.JS and P5.sound libraries for audio capture and analysis tools
 * http://p5js.org
 *
 * For more info, please read the README.MD file in the root folder for this app
 */


var appControllers = angular.module('appControllers', ['ngAnimate']);

appControllers.controller('SoundController', function($scope, p5){

    // tell Angular that the mic is on
    $scope.mic = true;
            
    $scope.mySketch = function(p) {

        // the sound audio waveform captured from the mic
        var mic;

        // the FFT analysis of the sound
        var fft;
        
        // the sound data array
        var data =[];

        // boolean to denote whether sound has been hit
        var analyzed = false;

        // whether the analysis was manually triggered
        var triggered = false;

        // threshold of sound that constitutes a 'hit' - grab from range slider
        var soundThreshold = $("#micSensitivity").val();

        // add an event listener for change of mic sensitivity (anytime input is dragged about)
        var micSensitivity = document.getElementById("micSensitivity");
        var micOutput = document.getElementById("micOutput");

        micSensitivity.addEventListener("input", function() {
            // higher value is less sensitive, so reverse it
            soundThreshold = parseFloat(1.0 - micSensitivity.value).toFixed(1);
            // inform about min and max settings
            if (micSensitivity.value == 0.1) {
                micOutput.value = 'min';
            } else if (micSensitivity.value == 0.9) {
                micOutput.value = 'max';
            } else {
                micOutput.value = micSensitivity.value;
            }
            
        });

        var mic;

        p.preload = function() {
           // sound = p.loadSound('ball-impact.mp3'); // used for testing with a 'control' sound
        }

        p.setup = function() {

            // initialize the microphone
            mic = new p5.AudioIn();
            mic.start();

            // smooth FFT by averaging with previous samples            
            var smoothing = 0.9;

            // sound buffer to analyze between 16-1024 (a power of 2)
            // duration of buffer == (bins * 2) / 44100 
            var binCount = 1024;

            // p5.sound fast Fourier transform function 
            // will be used to calculates frequency/amplitude of the sound sample using FFT
            fft = new p5.FFT(smoothing,binCount);

            // analyze input from the mic
            fft.setInput(mic);

            // create the Processing canvas in the top quarter of the screen height
            p.createCanvas(p.windowWidth, p.windowHeight * 0.25);
            p.noStroke();

        };

        p.draw = function() {
            p.background(122, 160, 175);

            var spectrum = fft.analyze(); 
            var waveform = fft.waveform();

            var level = mic.getLevel();
            

            // console.log(level);
            if (level > soundThreshold && !analyzed) {
              analyzeSound();
            }

            p.noFill();

            // fft spectrum drawn in orange
            p.stroke(229, 136, 94); 
            p.strokeWeight(3);
            p.beginShape();
            for (var i = 0; i< spectrum.length; i++){
                // expand spectrum visually by multiplying i * 2
                p.vertex(i * 2, p.map(spectrum[i], 0, 255, p.height, 0) );
            }
            p.endShape();

            // normal sound / time domain waveform drawn in white
            p.noFill();
            p.beginShape();
            p.stroke(255); 
            p.strokeWeight(1);
            for (var i = 0; i< waveform.length; i++){
                var x = p.map(i, 0, waveform.length, 0, p.width);
                var y = p.map( waveform[i], 0, 255, 0, p.height);
                p.vertex(x,y);
            }
            p.endShape();
        };

        var analyzeSound = function() {
            // pulse background color red 
            p.background(229, 136, 94);

            // sound has now been analyzed
            analyzed = true;
            $scope.analyzed = analyzed;

            // find maximum amplitude in a given range of frequencies
            var minFreq = 0;
            var maxFreq = 20000;
            var freqGap = 25;

            var currentEnergy = 0;
            var peakAmplitude = 0;
            var peakFrequency = 0;

            // build fft analysis array
            var dataArray = [];

            for (var i = minFreq; i < maxFreq; i=i + freqGap) {
                // get energy at this frequency
                currentEnergy = fft.getEnergy(i);

                // push each value as a JSON object
                data.push({
                    'frequency': i, 
                    'amplitude' : currentEnergy
                 });

                // push the x, y values to a data array
                dataArray.push([i, currentEnergy]);

                // var result = sound.map(function(value, index, array) {
                //     return [value.frequency, value.amplitude];
                // });

                // find the peak frequncy in the 2-5K frequency range
                if (((i >= 2000) && (i <= 5000)) && (currentEnergy > peakAmplitude)) {
                    // this is the new peak - assign current freq and amplitude as peaks
                    peakAmplitude = currentEnergy;
                    peakFrequency = i;
                }
            }

            // send data to an element in the main index template (not a partial)
            //document.getElementById("output").innerHTML = JSON.stringify(data);

            // $scope.soundData = data;

            // energy in different parts of the audio spectrum 
            // these vals are tweakable in p5.sound.js
            // this.bass = [20, 140];
            // this.lowMid = [140, 400];
            // this.mid = [400, 2600];
            // this.highMid = [2600, 5200];
            // this.treble = [5200, 14000];

            var bass = Math.round(fft.getEnergy('bass'));
            var lowMid = Math.round(fft.getEnergy('lowMid'));
            var mid = Math.round(fft.getEnergy('mid'));
            var highMid = Math.round(fft.getEnergy('highMid'));
            var treble = Math.round(fft.getEnergy('treble'));

            // make these available in the Angular Scope
            $scope.peakFrequency = peakFrequency;
            $scope.peakAmplitude = peakAmplitude;
            $scope.bass = bass;
            $scope.lowMid = lowMid;
            $scope.mid = mid;
            $scope.highMid = highMid;
            $scope.treble = treble;


            // stop the audio 
            // mic.stop();

            //update the Angular scope with this data, as it doesn't bind automatically
            $scope.$apply();

            // reset trigger
            triggered = false;


            //plot the data to a highchart

            $('#chart1').highcharts({
                chart: {
                    type: 'spline',
                    zoomType: 'x',
                    height: 480,

                    resetZoomButton: {
                        position: {
                            align: 'left', 
                            verticalAlign: 'top'
                            // x: 0,
                            // y: -30
                        }
                    }

                },
                colors: [
                    '#E5885E', 
                    '#0066FF', 
                    '#00CCFF'],
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                title: {
                    text: 'Frequency Analysis (FFT)'
                },
                xAxis: {
                    title: {
                        text: 'Frequency'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Amplitude'
                    },
                    min: 0,
                    max: 250,
                    tickinterval: 50
                },
                series: [{
                    name: "Sound Capture",
                    data: dataArray
                }],
                exporting: {
                    enabled: true
                }
            });

            $('#chart2').highcharts({
                chart: {
                    type: 'column',
                    height: 495
                },
                title: {
                    text: 'Average Energy Distribution'
                },
                colors: [
                    '#E5885E', 
                    '#0066FF', 
                    '#00CCFF'],
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    categories: [
                        'Bass<br>20-140Hz',
                        'Lo-Mid<br>140-400Hz',
                        'Mid<br>400-2600Hz',
                        'Hi-Mid<br>2600-5200',
                        'Treble<br>5200-14000',
                    ],
                    crosshair: true,
                    title: {
                        text: 'Frequency'
                    }
                },
                yAxis: {
                    min: 0,
                    max: 250,
                    tickinterval: 50,
                    title: {
                        text: 'Amplitude'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Sound Capture',
                    data: [bass, lowMid, mid, highMid, treble]
                }]
            });

        }

        $scope.resetSound = function(save) {
            if(save) {
                // output the file (file extension determines the save format)
                p.saveJSON(data, 'audio-spectrum.json', true);
            }
            // reset so that sound can be analyzed again
            $scope.analyzed = '';
            analyzed = false;
        }

        $scope.setMic = function(set) {
            if (set == 'mute') {
                mic.stop();
                $scope.mic = false;
            }
            else {
                mic.start();
                $scope.mic = true;
            }
        }

        $scope.triggerSound = function() {
            triggered = true;
            analyzeSound();
        }
    }

});

appControllers.controller('AnotherController', function($scope){

// stuff here

});


