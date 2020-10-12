//Variables
var is_mouse_down = false;
var filter_size = 10;
var brush_size = 1;
var color = '#000000';
//Objects
const sampler = {
    sample: (p) => {
        moving_average_unit.send_raw_point(p);
    },
};

const moving_average_unit = {
    _raw_buffer: [],//Has a threshold size to start to send data to the filter
    _last_index: 0,
    send_raw_point: (p) => {
        moving_average_unit._raw_buffer.push(p);
        if (moving_average_unit._raw_buffer.length > 3)
        {
            let i;
            for (i = moving_average_unit._last_index; i < moving_average_unit._raw_buffer.length; i++)
            {
                moving_average_unit.filter(moving_average_unit._raw_buffer, i, filter_size);
            }
            moving_average_unit._last_index = i;
        }
    },
    filter: (v, x, filter_size) => {
        const filtered_point = {
            x: v[x].x,
            y: v[x].y
        };
        for (let i = 1; i <= filter_size; i++)
        {
            filtered_point.x += v[clamp(x - i, 0, v.length - 1)].x;
            filtered_point.y += v[clamp(x - i, 0, v.length - 1)].y;
        }
        filtered_point.x /= (filter_size + 1);
        filtered_point.y /= (filter_size + 1);
        moving_average_unit.send_filtered_point(filtered_point);
    },
    send_filtered_point: (p) => { 
        painter.paint(p);
    },
    reset: () => {
        moving_average_unit._raw_buffer = [];
        moving_average_unit._last_index = 0;
    }
};

const painter = {
    init: (canvas) => {
        const _ctx = canvas.getContext('2d');
        if (!_ctx)
        {
            console.log('Can\'t paint: Context is null!');
            return;
        }
        _ctx.strokeStyle = '#000000';
        painter.ctx = _ctx;
    },
    ctx: null,
    _painting: false,
    begin_paint: (p) => {
        painter._painting = true;
        painter.ctx.strokeStyle = color;
        painter.ctx.lineWidth = brush_size;
        painter.ctx.beginPath();
        painter.ctx.moveTo(p.x, p.y);
    },
    paint: (p) => {
        if (!painter._painting)
        {
            painter.begin_paint(p);
            return;
        }
        painter.ctx.lineTo(p.x, p.y);
        painter.ctx.stroke();
    },
    end_paint: () => {
        painter._painting = false;
    }
}

const canvas = document.getElementById('canvas');
const filter_size_selector = document.getElementById('filter-size');
const brush_size_selector = document.getElementById('brush-size');
const color_selector = document.getElementById('color');

//Callbacks
function mouse_down()
{
    //Set is_mouse_down flag
    is_mouse_down = true;
}

function mouse_up()
{
    //Reset is_mouse_down flag
    is_mouse_down = false;
    //Flush and clear sampler buffer
    painter.end_paint();
    moving_average_unit.reset();
}
function mouse_out()
{
    is_mouse_down = false;
}

function mouse_move(e)
{
    //If is_mouse_down, send points to sampler
    if (is_mouse_down)
    {
        sampler.sample({x: e.offsetX, y: e.offsetY});
    }
    document.getElementById('d-mouse-pos').innerHTML = `Mouse position: ( ${e.offsetX}, ${e.offsetY})`;
}

function change_filter_size()
{
    filter_size = filter_size_selector.value;
    try{
        filter_size = Number.parseInt(filter_size);
        if (Number.isNaN(filter_size))
            filter_size = 10;
    } catch(e)
    {
        filter_size = 10;
    }
}

function change_brush_size()
{
    brush_size = brush_size_selector.value;
    try{
        brush_size = Number.parseInt(brush_size);
        if (Number.isNaN(brush_size))
        brush_size = 1;
    } catch(e)
    {
        brush_size = 1;
    }
}

function change_color()
{
    color = color_selector.value;
    // color_selector.style.backgroundColor = color;
}

function init()
{
    document.body.onmousedown = mouse_down;
    document.body.onmouseup = mouse_up;
    document.body.onmousemove = mouse_move;
    // canvas.onmouseout = mouse_out;
    
    filter_size_selector.onchange = change_filter_size;
    brush_size_selector.onchange = change_brush_size;
    color_selector.onchange = change_color;

    painter.init(canvas);
    canvas.width =  window.innerWidth;
    canvas.height =  window.innerHeight;
    // document.getElementById('options').style.width = window.innerWidth;
}


//Helper functions
const clamp = (t, min, max) => t < min ? min :
                               t > max ? max : t;



init();