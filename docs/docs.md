# Arquitetura

## Fluxo de informações

```raw
      .----------.
      | Producer |
.-----'----------'-----.
| mouse_event_listener |-----//Capture mouse events
'----------------------'
            |
  .---------+----------.
  |                    |
  V                    V
.------------.    .---------------.
| mouse_move |    | mouse_down_up |
'------------'    '---------------'
      |                   |
      |                   _                        .---------.    _.------------.
      '------------------´|`-----------------------| sampler |---||| point_list |
                          |                        '---------'    T'------------'
                          +----//Signal to create or                      |
                          |   //destroy a filter                          |
.---------------------.   |               .-------------------------------'
| moving_average_unit |<--'               |              
'---------------------'                   |              
      |                                   |          .---------.
      |                                   |          | painter |--//Renders from the
      |                                   |          '---------' //last 3º until 3º
      _                                   |               ^     //points
     |-|                                  |               |
.-----------------------.                 |               |
| moving_average_filter |<----------------'               |
'-----------------------'                                 |
        |                                                 |
        |                                                 |
        '-------------------------------------------------'
```

## Pseudocódigo

```javascript

canvas.onmouseup = () => is_mouse_down = false;
canvas.onmousedown = () => is_mouse_down = true;


canvas.onmousemove = (e) => {
	if (is_mouse_down)
	{
		var x, y = /*get x and y*/;
		sampler.point_list.push([x, y]);
	}
}

const moving_average_unit = {
	moving_average_filter,
	point_list:
}


function createPainter(canvas)
{
	const painter = {};
	return painter;
}

```