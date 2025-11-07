export class GrassSystem {
    constructor() {
        this.grassBlades = [];
    }

    addGrassToPlatform(platform, density = 5) {
        // Erstelle wildere Grashalme auf einer Plattform
        const bladeCount = Math.floor(platform.width / density);
        
        for (let i = 0; i < bladeCount; i++) {
            const x = platform.x + (i * density) + Math.random() * 4;
            const y = platform.y;
            const height = 10 + Math.random() * 10; // Länger und variabler
            const isPink = Math.random() > 0.5; // 50% pink, 50% grün
            
            this.grassBlades.push({
                x: x,
                y: y,
                baseX: x,
                height: height,
                sway: Math.random() * Math.PI * 2,
                swaySpeed: 3 + Math.random() * 2, // Schneller
                swayAmount: 2 + Math.random() * 2, // Mehr Bewegung
                affected: 0,
                pixelWidth: 2,
                isPink: isPink,
                swayOffset: Math.random() * Math.PI // Unterschiedlicher Start
            });
        }
    }

    update(deltaTime, player) {
        this.grassBlades.forEach(blade => {
            // Wildere natürliche Bewegung
            blade.sway += blade.swaySpeed * deltaTime;
            
            // Spieler-Interaktion - größerer Radius
            const distToPlayer = Math.abs(blade.x - (player.x + player.width / 2));
            const verticalDist = Math.abs(blade.y - (player.y + player.height));
            
            // Wenn Spieler nah ist
            if (distToPlayer < 80 && verticalDist < 25) {
                const direction = blade.x > player.x ? 1 : -1;
                const strength = 1 - (distToPlayer / 80); // Stärker je näher
                blade.affected = direction * 5 * strength; // Stärkerer Push
            } else {
                // Zurück zur Mitte
                blade.affected *= 0.85;
            }
        });
    }

    render(ctx) {
        this.grassBlades.forEach(blade => {
            // Berechne wildere Schwankung
            const naturalSway = Math.sin(blade.sway + blade.swayOffset) * blade.swayAmount;
            const totalSway = naturalSway + blade.affected;
            
            // Pixel-Art Grashalm (4 Segmente statt 3)
            const segments = 4;
            const segmentHeight = blade.height / segments;
            
            for (let i = 0; i < segments; i++) {
                const swayAtHeight = totalSway * ((i + 1) / segments); // Mehr oben
                const x = blade.x + swayAtHeight;
                const y = blade.y - (i + 1) * segmentHeight;
                
                // Schatten
                ctx.fillStyle = blade.isPink ? 'rgba(139, 51, 107, 0.3)' : 'rgba(0, 100, 0, 0.3)';
                ctx.fillRect(x + 1, y + 1, blade.pixelWidth, segmentHeight);
                
                if (blade.isPink) {
                    // Pink Gras - verschiedene Töne
                    const brightness = i === segments - 1 ? 255 : 200 + i * 15;
                    const green = 100 + i * 20;
                    const blue = 150 + i * 25;
                    ctx.fillStyle = `rgb(${brightness}, ${green}, ${blue})`;
                } else {
                    // Grünes Gras
                    const brightness = 76 + i * 35;
                    ctx.fillStyle = `rgb(${brightness}, ${175 + i * 20}, ${brightness})`;
                }
                
                ctx.fillRect(x, y, blade.pixelWidth, segmentHeight);
            }
            
            // Hellere Spitze
            const tipX = blade.x + totalSway * 1.2;
            const tipY = blade.y - blade.height - 1;
            ctx.fillStyle = blade.isPink ? '#FFB3D9' : '#A5D6A7';
            ctx.fillRect(tipX - 0.5, tipY, blade.pixelWidth + 1, 2);
        });
    }

    clear() {
        this.grassBlades = [];
    }
}
