class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'normal' or 'glue'
        
        // Set colors based on type
        if (this.type === 'glue') {
            this.color = '#9C27B0'; // Purple for glue
        } else {
            this.color = '#333'; // Dark gray for normal
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add visual indicator for glue platforms
        if (this.type === 'glue') {
            ctx.fillStyle = '#E1BEE7';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        }
    }
}
