//Flags
var is_mouse_down = false;

//Objects
const sampler = {
    reset: () => sampler.points = [],
    points: []
}

const canvas = document.getElementById('canvas');

//Callbacks
function mouse_down()
{
//Set is_mouse_down flag
//Flush and clear sampler buffer
}

function mouse_up()
{
//Reset is_mouse_down flag
}

function mouse_move(e)
{
//If is_mouse_down, send points to sampler
}