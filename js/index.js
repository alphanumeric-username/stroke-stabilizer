var is_mouse_down = false;

const config = {
    filter_size: 10,
    brush_size: 1,
    color: '#000000',
}

const sampler = {
    sample: (p) => {
        moving_average_unit.send_raw_point(p);
    },
};

const moving_average_unit = {
    _raw_buffer: [],
    _last_index: 0,
    send_raw_point: (p) => {
        moving_average_unit._raw_buffer.push(p);
        if (moving_average_unit._raw_buffer.length > 3)
        {
            let i;
            for (i = moving_average_unit._last_index; i < moving_average_unit._raw_buffer.length; i++)
            {
                moving_average_unit.filter(moving_average_unit._raw_buffer, i, config.filter_size);
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
        console.log(canvas.width, canvas.height);
        paint_history.push_frame(painter.ctx.getImageData(0, 0, canvas.width, canvas.height));
    },
    ctx: null,
    _painting: false,
    begin_paint: (p) => {
        painter._painting = true;
        painter.ctx.strokeStyle = config.color;
        painter.ctx.lineWidth = config.brush_size;
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
        paint_history.push_frame(painter.ctx.getImageData(0, 0, canvas.width, canvas.height));
    },
    undo: () => {
        painter.ctx.putImageData(paint_history.undo(), 0, 0);
    },
    redo: () => {
        painter.ctx.putImageData(paint_history.redo(), 0, 0);
    }
}

const paint_history = {
    _history: [],
    _currentidx: -1,
    _max_history_size: 100,
    undo: () => {
        paint_history._currentidx = Math.max(paint_history._currentidx - 1, 0);
        return paint_history._history[paint_history._currentidx];
    },
    redo: () => {
        paint_history._currentidx = Math.min(paint_history._currentidx + 1, paint_history._history.length - 1);
        return paint_history._history[paint_history._currentidx];
    },
    push_frame: (frame) => {
        paint_history._history = paint_history._history.slice(0, paint_history._currentidx + 1);
        paint_history._history.push(frame)
        if (paint_history._history.length >= paint_history._max_history_size)
        {
            paint_history._history.shift()
            return;
        }
        paint_history._currentidx++;
    },
}


const canvas = document.getElementById('canvas');
const filter_size_selector = document.getElementById('filter-size');
const brush_size_selector = document.getElementById('brush-size');
const color_selector = document.getElementById('color');

function mouse_down()
{
    is_mouse_down = true;
}

function mouse_up()
{
    is_mouse_down = false;
    painter.end_paint();
    moving_average_unit.reset();
}
function mouse_out()
{
    // is_mouse_down = false;
}

function update_mouse_down (buttons) {
    if (buttons%2 == 1)
    {
        is_mouse_down = true;
    } 
    else 
    {
        if (is_mouse_down)
        {
            is_mouse_down = false;
            mouse_up();
        }
    }
}

/**
 * 
 * @param {MouseEvent} e 
 */
function mouse_move(e)
{
    update_mouse_down(e.buttons);
    console.log(is_mouse_down);
    if (is_mouse_down)
    {
        sampler.sample({x: e.offsetX, y: e.offsetY});
    }
    document.getElementById('d-mouse-pos').innerHTML = `Mouse position: ( ${e.offsetX}, ${e.offsetY})`;
}

function change_filter_size()
{
    config.filter_size = filter_size_selector.value;
    try{
        config.filter_size = Number.parseInt(config.filter_size);
        if (Number.isNaN(config.filter_size))
            config.filter_size = 10;
    } catch(e)
    {
        config.filter_size = 10;
    }
}

function change_brush_size()
{
    config.brush_size = brush_size_selector.value;
    try{
        config.brush_size = Number.parseInt(config.brush_size);
        if (Number.isNaN(config.brush_size))
            config.brush_size = 1;
    } catch(e)
    {
        config.brush_size = 1;
    }
}

function change_color()
{
    config.color = color_selector.value;
}

function key_event_handler (e)
{
    if (e.ctrlKey)
    {
        switch(e.code)
        {
            case 'KeyZ':
                painter.undo();
                break;
            case 'KeyY':
                painter.redo();
                break;
        }
    }
}

function init()
{
    // const listener = document.body;
    const listener = window;
    listener.onmousemove = mouse_move;
    listener.onkeypress = key_event_handler;
    
    filter_size_selector.onchange = change_filter_size;
    brush_size_selector.onchange = change_brush_size;
    color_selector.onchange = change_color;

    canvas.width =  window.innerWidth;
    canvas.height =  window.innerHeight;
    painter.init(canvas);
}

init();

const clamp = (t, min, max) => t < min ? min :
                               t > max ? max : t;
