interface iCircle {
    rx: number,
    ry: number,
    r: number,
    start: number,
    end: number,
    dir?: boolean,
}

class SnakeGame {
    cellWidth: number
    cellNum: number
    gridWidth: number
    circleRadius:number
    flag: number[][] // 占位坐标 (10,10,290,290)
    ctx: CanvasRenderingContext2D
    cx: number
    cy: number
    ax: number
    ay: number
    arrX: number[]
    arrY: number[]
    snake_len: number
    fps: number
    score: number
    count: number
    arrScore: number[]
    maxScore: number
    setScore: Function
    setMaxScore: Function
    clearTimer: Function
    constructor(canvas: HTMLCanvasElement, {
        setScore,
        setMaxScore,
        clearTimer,
    }) {
        // init
        this.ctx = canvas.getContext("2d");
        this.gridWidth = ~~(canvas.width);
        this.cellWidth = 10;
        this.cellNum = ~~(this.gridWidth / this.cellWidth);
        this.circleRadius = ~~(this.cellWidth / 2);

        this.flag = [];
        this.cx = 60;
        this.cy = 240;
        this.arrX = [];
        this.arrY = [];
        this.snake_len = (3 - 1);
        this.fps = 6;
        this.score = 0;
        this.count = 0;
        this.arrScore = [];
        this.maxScore = 0;

        this.setScore = setScore;
        this.setMaxScore = setMaxScore;
        this.clearTimer = clearTimer;

        // 队列数据初始化
        for (let i = 0, len = this.snake_len; i < len; i++) {
            this.arrX.push(60);
            this.arrY.push(260 - this.cellWidth * i); // [260,250]
        }

        // 页面初始化
        this.coord();
        this.drawSnake(this.cx, this.cy, 2);
        this.coordLabel(this.cx, this.cy, this.arrX, this.arrY);
        // 生成苹果
        this.ax = Math.floor(Math.random() * 270 + this.cellWidth);
        this.ay = Math.floor(Math.random() * 270 + this.cellWidth);
        while (this.flag[this.ax][this.ay] === 1) {
            this.ax = Math.floor(Math.random() * 270 + this.cellWidth);
            this.ay = Math.floor(Math.random() * 270 + this.cellWidth);
        }
        this.drawApple(this.ax, this.ay);
    }
    // 绘制 圆
    circle(ctx: CanvasRenderingContext2D, data: iCircle, s_style: string, f_style: string): void {
        ctx.save();
        ctx.beginPath();
        ctx.arc(data.rx, data.ry, data.r, data.start, data.end, data.dir);
        ctx.fillStyle = f_style || "#fff";
        ctx.strokeStyle = s_style || "#666";
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
    // 绘制 坐标图
    coord(): void {
        this.ctx.beginPath();
        for (let i = 0; i <= this.cellNum; i++) {
            this.ctx.moveTo(0, i * this.cellWidth);
            this.ctx.lineTo(this.gridWidth, i * this.cellWidth);
            this.ctx.strokeStyle = "transparent";
        }
        this.ctx.stroke();
        this.ctx.beginPath();
        for (let j = 0; j <= this.cellNum; j++) {
            this.ctx.moveTo(j * this.cellWidth, 0);
            this.ctx.lineTo(j * this.cellWidth, this.gridWidth);
            this.ctx.strokeStyle = "transparent";
        }
        this.ctx.stroke();
    }
    // 存储 占位坐标数据
    coordLabel(cx: number, cy: number, arrX: number[], arrY: number[]): void {
        // 清空所有数据，初始化
        for (let i = 0; i < this.gridWidth; i++) {
            this.flag[i] = [];
            for (let j = 0; j < this.gridWidth; j++) {
                this.flag[i][j] = 0;
            }
        }
        // 设置蛇头的占位标志为-1
        this.flag[cx][cy] = -1;
        // 设置蛇身的占位坐标标志为1
        for (let k = 0, len = arrX.length; k < len; k++) {
            this.flag[(+arrX[k])][(+arrY[k])] = 1;
        }
    }
    // 边界 碰撞检测
    isStop(cx: number, cy: number): boolean {
        let stop = false;
        if (cx >= 297 || cy >= 297 || cx <= 3 || cy <= 3) {
            stop = true;
        }
        return stop;
    }
    // 绘制 蛇
    drawSnake(cx: number, cy: number, len: number): void {
        // 蛇头
        this.circle(this.ctx, {
            rx: cx,
            ry: cy,
            r: this.circleRadius,
            start: 0,
            end: 2 * Math.PI,
        }, "#333", "#26f");
        // 蛇身
        for (let i = len - 1; i >= 0; i--) {
            this.circle(this.ctx, {
                rx: this.arrX[i],
                ry: this.arrY[i],
                r: this.circleRadius,
                start: 0,
                end: 2 * Math.PI,
            }, "#333", '#0c3');
        }
    }
    // 绘制苹果
    drawApple(ax: number, ay: number): void {
        this.circle(this.ctx, {
            rx: ax,
            ry: ay,
            r: this.circleRadius,
            start: 0,
            end: 2 * Math.PI,
        }, "#333", "#f20");
    }
    // 运动 转换方向
    moveByDir(dir: string): void {
        let strageMode = {
            L: () => {
                this.cx = this.cx - this.cellWidth; this.cy = this.cy;
            },
            T: () => {
                this.cx = this.cx; this.cy = this.cy - this.cellWidth;
            },
            R: () => {
                this.cx = this.cx + this.cellWidth; this.cy = this.cy;
            },
            D: () => {
                this.cx = this.cx; this.cy = this.cy + this.cellWidth;
            },
        };
        strageMode[dir]();
    }
    // 页面初始化
    initFunc(): void {
        this.cx = 60;
        this.cy = 240;
        this.fps = 6;
        this.snake_len = (3 - 1);
        this.arrX = [];
        this.arrY = [];
        for (let i = 0, len = this.snake_len; i < len; i++) {
            this.arrX.push(60);
            this.arrY.push(260 - this.cellWidth * i);  // [260,250]
        }
        this.score = 0;
        this.count = 0;
        this.setScore(this.score);
        this.ctx.clearRect(0, 0, this.gridWidth, this.gridWidth);
        this.coord();
        this.drawSnake(this.cx, this.cy, this.snake_len);
        this.drawApple(this.ax, this.ay);
    }
    // 主函数
    changeToDir(dir: string): void {
        // 页面初始化
        this.ctx.clearRect(0, 0, this.gridWidth, this.gridWidth);
        this.coord();
        this.drawApple(this.ax, this.ay);
        // 撞墙检测
        if (this.isStop(this.cx, this.cy)) {
            this.clearTimer();
            alert("Game Over!!!");
            this.initFunc();
            return;
        }
        // 绘制蛇
        this.drawSnake(this.cx, this.cy, this.snake_len);
        // 存储数据 队列 先进先出
        this.arrX.push(this.cx);
        this.arrX.shift();
        this.arrY.push(this.cy); // 入队   [260,250,240*]   [250,240,230*]
        this.arrY.shift(); // 出队	 [250,240]       [240,230]   
        // 执行运动语句
        this.moveByDir(dir);    // 230   220
        // 吃苹果
        if (Math.abs(this.cx - this.ax) <= 7 && Math.abs(this.cy - this.ay) <= 7) {
            // 计算得分及最高分
            this.count++;
            this.score = this.count * 100;
            this.arrScore.push(this.score);
            this.maxScore = Math.max.apply(null, this.arrScore);
            this.setScore(this.score);
            this.setMaxScore(this.maxScore);
            // 增加游戏难度
            if (this.count % 5 === 0) {
                this.fps = this.fps + 1;
                // 重新生成苹果坐标
                this.ax = Math.floor(Math.random() * 2*this.cellWidth) + 260;
                this.ay = Math.floor(Math.random() * 2*this.cellWidth) + 260;
                while (this.flag[this.ax][this.ay] === 1) {
                    this.ax = Math.floor(Math.random() * 2*this.cellWidth) + 260;
                    this.ay = Math.floor(Math.random() * 2*this.cellWidth) + 260;
                }
            } else {
                // 重新生成苹果坐标
                this.ax = Math.floor(Math.random() * 270 + this.cellWidth);
                this.ay = Math.floor(Math.random() * 270 + this.cellWidth);
                while (this.flag[this.ax][this.ay] === 1) {
                    this.ax = Math.floor(Math.random() * 270 + this.cellWidth);
                    this.ay = Math.floor(Math.random() * 270 + this.cellWidth);
                }
            }

            this.drawApple(this.ax, this.ay);
            // 蛇身增长一节
            this.snake_len += 1;
            this.arrX.push(this.cx); // 入队
            this.arrY.push(this.cy);
        }
        // 记录蛇的占位坐标
        this.coordLabel(this.cx, this.cy, this.arrX, this.arrY);
        // 幢到自己身体检测
        for (let m = 0, len = this.arrX.length - 1; m < len; m++) {
            if (this.cx === this.arrX[m] && this.cy === this.arrY[m]) {
                this.clearTimer();
                alert('蛇撞到自己了');
                this.initFunc();
            }
        }
    }
}

export default SnakeGame;
