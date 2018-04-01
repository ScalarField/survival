//
let canvasElement;
let canvasContext;
// representing the rectangle position (x, y)
let point = {};
function main()
{
    canvasElement = document.getElementById("canvas");
    let canvasElementStyle = window.getComputedStyle(canvasElement);
    canvasElement.width = parseInt(canvasElementStyle.width);
    canvasElement.height = parseInt(canvasElementStyle.height);
    // center the rectangle
    point.x = canvasElement.width / 2;
    point.y = canvasElement.height / 2;
    point.x -= 25;
    point.y -= 25;
    canvasContext = canvasElement.getContext("2d");
    if (!canvasContext)
    {
        alert("Error: Couldn't create canvasContext");
    }
    window.onkeydown = (event) =>
    {
        let code = event.keyCode || event.charCode;
        switch (code)
        {
            case 37:
                console.log("Left");
                point.x += -5;
                break; //Left key

            case 38:
                console.log("Up");
                point.y += -5;
                break; //Up key

            case 39:
                console.log("Right");
                point.x += 5;
                break; //Right key

            case 40:
                console.log("Down");
                point.y += 5;
                break; //Down key

            default: console.log(code); //Everything else
        }
        Draw();
    }
    Draw();
}
function Draw()
{
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasContext.fillStyle = "white";
    canvasContext.strokeStyle = "black"
    canvasContext.rect(0, 0, canvasElement.width, canvasElement.height);
    canvasContext.fillStyle = "red";
    canvasContext.beginPath();
    canvasContext.rect(point.x, point.y, 50, 50);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}
main();
