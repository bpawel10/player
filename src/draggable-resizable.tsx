import { children, Component, createSignal, ParentProps } from 'solid-js';

export interface IDraggableResizableProps extends ParentProps {
  initWidth: number;
  initHeight: number;
  initX: number;
  initY: number;
}

enum MouseDownType {
  TOP,
  LEFT,
  CENTER,
  RIGHT,
  BOTTOM,
}

export const DraggableResizable: Component<IDraggableResizableProps> = ({
  initWidth,
  initHeight,
  initX,
  initY,
  ...props
}) => {
  const MIN_SIZE = 30;

  const c = children(() => props.children);

  const [width, setWidth] = createSignal(initWidth);
  const [height, setHeight] = createSignal(initHeight);
  const [x, setX] = createSignal(initX);
  const [y, setY] = createSignal(initY);

  const [currentMouseDownTypes, setCurrentMouseDownTypes] = createSignal<
    MouseDownType[]
  >([]);

  const resizeTop = (movementY: number) => {
    setHeight(height() - movementY);
    setY(y() + movementY);
  };
  const resizeLeft = (movementX: number) => {
    setWidth(width() - movementX);
    setX(x() + movementX);
  };
  const resizeRight = (movementX: number) => setWidth(width() + movementX);
  const resizeBottom = (movementY: number) => setHeight(height() + movementY);
  const move = (movementX: number, movementY: number) => {
    setX(x() + movementX);
    setY(y() + movementY);
  };

  window.addEventListener('mousemove', ({ movementX, movementY }) => {
    if (!currentMouseDownTypes().length) {
      return false;
    }

    movementX = Math.min(movementX, width() - MIN_SIZE);
    movementY = Math.min(movementY, height() - MIN_SIZE);
    currentMouseDownTypes().includes(MouseDownType.TOP) && resizeTop(movementY);
    currentMouseDownTypes().includes(MouseDownType.LEFT) &&
      resizeLeft(movementX);
    currentMouseDownTypes().includes(MouseDownType.CENTER) &&
      move(movementX, movementY);
    currentMouseDownTypes().includes(MouseDownType.RIGHT) &&
      resizeRight(movementX);
    currentMouseDownTypes().includes(MouseDownType.BOTTOM) &&
      resizeBottom(movementY);
  });

  window.addEventListener('mouseup', () => setCurrentMouseDownTypes([]));

  return (
    <div
      class="group absolute select-none rounded-md hover:bg-white hover:bg-opacity-10 z-20"
      style={{
        width: `${width()}px`,
        height: `${height()}px`,
        left: `${x()}px`,
        top: `${y()}px`,
      }}
    >
      <div
        class="absolute -top-1 -left-1 w-2 h-2 cursor-nwse-resize"
        onMouseDown={() =>
          setCurrentMouseDownTypes([MouseDownType.TOP, MouseDownType.LEFT])
        }
      />
      <div
        class="absolute -top-1 w-full h-2 cursor-ns-resize"
        onMouseDown={() => setCurrentMouseDownTypes([MouseDownType.TOP])}
      />
      <div
        class="absolute -top-1 -right-1 w-2 h-2 cursor-nesw-resize"
        onMouseDown={() =>
          setCurrentMouseDownTypes([MouseDownType.TOP, MouseDownType.RIGHT])
        }
      />
      <div
        class="absolute -left-1 w-2 h-full cursor-ew-resize"
        onMouseDown={() => setCurrentMouseDownTypes([MouseDownType.LEFT])}
      />
      <div
        class="absolute top-0 left-0 right-0 w-full h-8 cursor-move z-30 group-hover:bg-white group-hover:bg-opacity-30"
        style={{ 'border-radius': '5px 5px 0px 0px' }}
        onMouseDown={() => setCurrentMouseDownTypes([MouseDownType.CENTER])}
      />
      <div
        class="absolute -right-1 w-2 h-full cursor-ew-resize"
        onMouseDown={() => setCurrentMouseDownTypes([MouseDownType.RIGHT])}
      />
      <div
        class="absolute -bottom-1 -left-1 w-2 h-2 cursor-nesw-resize"
        onMouseDown={() =>
          setCurrentMouseDownTypes([MouseDownType.BOTTOM, MouseDownType.LEFT])
        }
      />
      <div
        class="absolute -bottom-1 w-full h-2 cursor-ns-resize"
        onMouseDown={() => setCurrentMouseDownTypes([MouseDownType.BOTTOM])}
      />
      <div
        class="absolute -bottom-1 -right-1 w-2 h-2 cursor-nwse-resize"
        onMouseDown={() =>
          setCurrentMouseDownTypes([MouseDownType.BOTTOM, MouseDownType.RIGHT])
        }
      />
      {c}
    </div>
  );
};
