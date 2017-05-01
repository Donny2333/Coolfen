/**
 * Created by Donny on 2015/11/25.
 */
"use strict";

angular.module('CoolfenMobileApp.directives')
  .directive('polo', function (Device) {
    return {
      restrict: "E",
      templateUrl: "templates/home/polo.html",
      replace: true,
      scope: {
        point: '='
      },
      transclude: true,
      link: function (scope, element, attrs) {

        /**
         * note: wave function : y = Asin(wx) + B;
         */
        var canvas, context, r, height, width, t,
          A, w, B, desB;

        init();

        /**
         * init parameters of polo canvas
         */
        function init() {
          if (Device.screen.width <= 320) {
            if (Device.screen.height <= 480) {
              // iPhone 4
              attrs.height = 170-22;
              attrs.width = 170-22;
            } else {
              // iPhone 5
              attrs.height = 200-22;
              attrs.width = 200-22;
            }
          } else if (Device.screen.width > 320 && Device.screen.width <= 375) {
            // iPhone 6
            attrs.height = 222-22;
            attrs.width = 222-22;

          } else if (Device.screen.width >= 414) {
            // iPhone 6p
            attrs.height = 250-22;
            attrs.width = 250-22;
          } else {
            attrs.height = 222-22;
            attrs.width = 222-22;
          }

          canvas = document.getElementById('canvas');

          canvas.height = attrs.height;
          canvas.width = attrs.width;

          context = canvas.getContext('2d');

          height = canvas.height;
          width = canvas.width;

          r = canvas.width / 2;
          t = 0;
          A = r / 12;
          w = (2 * Math.PI) / 300;
          B = r - scope.point / 100 * 2 * r;
          desB = B;

          scope.countFrom = 0;

          canvas.addEventListener("onclick", onclick, false);

          /**
          *canvas.addEventListener("onclick", onclick, false);
           */
          draw();

        }

        scope.$watch(function () {
            return scope.point;
          },
          function (value) {
          	setPoint(value);
	        scope.countFrom = scope.countTo;
            scope.countTo = scope.point;
          	if(scope.point<10){
          		$('.polo-point').css('left','42%');
          	}else if(scope.point>=100){
          		$('.polo-point').css('left','33%');
          	}else {
              $('.polo-point').css('left','38%');
            }
          }
        );

        function setPoint(point) {
          var temp;
          if (point <= 100) {
            temp = r - point / 100 * 2 * r;
          } else {
            temp = -r;
          }
          desB = temp;
//        console.log("point: " + point + "; desB: " + desB);
        }

        /**
         * draw polo animation
         */
        function draw() {
          context.clearRect(0, 0, width, height);

//        context.strokeStyle = "#FFA500";
			 context.strokeStyle = "#fff";

          // background wave
          context.beginPath();
          drawWave(t - 3 * r / 5);

          context.fillStyle = "#FEFF9D";

          drawBackground();
          context.closePath();
          context.fill();

          // middle wave
          context.beginPath();
          drawWave(t - 3 * r / 20);

          context.fillStyle = "#fff";

          drawBackground();
          context.closePath();
          context.fill();

          // front wave
          context.beginPath();
          drawWave(t);

          var gradient = context.createLinearGradient(0, 100, 0, 200);
          gradient.addColorStop(0, "#FFd600");
          gradient.addColorStop(1, "#FFAE00");

          context.fillStyle = gradient;

          drawBackground();
          context.closePath();
          context.fill();


          // circle border
          context.beginPath();
          drawCircle();
          context.stroke();

          // Update the time and draw again
          t = (t + 2) % 300;
          setTimeout(draw, 15);
        };

        function drawCircle() {
          context.save();
          context.translate(width / 2, height / 2);
          context.arc(0, 0, r, 0, 2 * Math.PI);
          context.restore();
        }

        function drawWave(t) {
          raiseWave();

          context.save();
          context.translate(width / 2 - r, height / 2);

          var x = 0;
          var y = Math.sin(t);
          context.moveTo(x, y);

          for (var i = 0; i <= 2 * r; i += 10) {
            x = i;
            y = A * Math.sin(w * (x + t)) + B;
            context.lineTo(x, y);
          }
          context.restore();
        }

        function drawBackground() {
          context.save();
          context.translate(width / 2, height / 2);
          context.arc(0, 0, r - 1, 0, Math.PI);
          context.restore();
        }

        function deboost() {
          if (A <= 0.1) {
            A = 0;
            return;
          }

          if (desB > -r && desB < r) {
            A -= A / 500;
          } else {
            A -= A / 100;
          }
        }

        function raiseWave() {
          if (Math.abs(desB - B) > 1) {
            B += (desB - B) / 100;
            A = r / 12;
          } else {
            B = desB;
            deboost();
          }
        }
      }
    }
  })
