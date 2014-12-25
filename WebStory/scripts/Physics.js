// From NoLifeStory (V3?)

(function(context) {
  var down_jump_multiplier = 0.35355339;
  var epsilon = 0.00001;
  var fall_speed = 670;
  var float_coefficient = 0.01;
  var float_drag_1 = 100000;
  var float_drag_2 = 10000;
  var float_multiplier = 0.0008928571428571428;
  var fly_force = 120000;
  var fly_jump_dec = 0.35;
  var fly_speed = 200;
  var gravity_acc = 2000;
  var jump_speed = 555;
  var max_friction = 2;
  var max_land_speed = 162.5;
  var min_friction = 0.05;
  var shoe_fly_acc = 0;
  var shoe_fly_speed = 0;
  var shoe_mass = 100;
  var shoe_swim_acc = 1;
  var shoe_swim_speed_h = 1;
  var shoe_swim_speed_v = 1;
  var shoe_walk_acc = 1;
  var shoe_walk_drag = 1;
  var shoe_walk_jump = 1.0;
  var shoe_walk_slant = 0.9;
  var shoe_walk_speed = 1.0;
  var slip_force = 60000;
  var slip_speed = 120;
  var swim_force = 120000;
  var swim_jump = 700;
  var swim_speed = 140;
  var swim_speed_dec = 0.9;
  var walk_drag = 80000;
  var walk_force = 140000;
  var walk_speed = 125;

  var Physics = context.Physics = function() {
    this.left = this.right = this.down = this.up = false;
    this.fh = null;
    this.djump = null;
    this.lr = null;
    this.x = this.y = this.r = 0;
    this.vx = this.vy = this.vr = 0.0;
    this.layer = 7;
    this.group = 0;
    this.laststep = 0;
  };

  Physics.prototype.update = function() {
    var that = this;
    
    var mleft = this.left && !this.right;
    var mright = !this.left && this.right;
    var mup = this.up && !this.down;
    var mdown = !this.up && this.down;
    var flying = context.currentMap.info.swim;
    var delta_now = context.frame.game.time.now / 1000;
    while (delta_now > this.laststep) {
      this.laststep += 0.01;
      var delta = 0.01;
      if (this.lr) {
      } else if (this.fh) {
        var fx = this.fh.x2 - this.fh.x1, fy = this.fh.y2 - this.fh.y1, fx2 = fx * fx, fy2 = fy * fy, len = Math
            .sqrt(fx2 + fy2);
        var mvr = this.vx * len / fx;
        mvr -= this.fh.force;
        var fs = context.currentMap.info.fs / shoe_mass * delta;
        var maxf = (flying ? swim_speed_dec : 1.) * walk_speed * shoe_walk_speed;
        var drag = Math.max(Math.min(shoe_walk_drag, max_friction), min_friction) * walk_drag;
        var slip = fy / len;
        if (shoe_walk_slant < Math.abs(slip)) {
          var slipf = slip_force * slip;
          var slips = slip_speed * slip;
          mvr += mleft ? -drag * fs : mright ? drag * fs : 0;
          mvr = slips > 0 ? Math.min(slips, mvr + slipf * delta) : Math.max(slips, mvr + slipf * delta);
        } else {
          mvr = mleft ? mvr < -maxf ? Math.min(-maxf, mvr + drag * fs) : Math.max(-maxf, mvr - shoe_walk_acc
              * walk_force * fs) : mright ? mvr > maxf ? Math.max(maxf, mvr - drag * fs) : Math.min(maxf, mvr
              + shoe_walk_acc * walk_force * fs) : mvr < 0.0 ? Math.min(0.0, mvr + drag * fs) : mvr > 0.0 ? Math.max(
              0.0, mvr - drag * fs) : mvr;
        }
        mvr += this.fh.force;
        this.vx = mvr * fx / len, this.vy = mvr * fy / len;
      } else {
        if (flying) {
          var vmid = shoe_swim_acc;
          var vmax = shoe_swim_speed_h * swim_speed;
          var shoefloat = float_drag_1 / shoe_mass * delta;
          this.vx = this.vx < -vmax ? Math.min(-vmax, this.vx + shoefloat) : this.vx > vmax ? Math.max(vmax, this.vx - shoefloat) : mleft ? Math
              .max(-vmax, this.vx - shoefloat) : mright ? Math.min(vmax, this.vx + shoefloat) : this.vx > 0 ? Math.max(0.0, this.vx
              - shoefloat) : Math.min(0.0, this.vx + shoefloat);
          var flys = fly_force / shoe_mass * delta * vmid;
          this.vy = mup ? this.vy < vmax * 0.3 ? Math.min(vmax * 0.3, this.vy + flys * 0.5) : Math.max(vmax * 0.3, this.vy - flys)
              : mdown ? this.vy < vmax * 1.5 ? Math.min(vmax * 1.5, this.vy + flys) : Math.max(vmax * 1.5, this.vy - flys * 0.5)
                  : this.vy < vmax ? Math.min(vmax, this.vy + flys) : Math.max(vmax, this.vy - flys);
        } else {
          var shoefloat = float_drag_2 / shoe_mass * delta;
          this.vy > 0 ? this.vy = Math.max(0.0, this.vy - shoefloat) : this.vy = Math.min(0.0, this.vy + shoefloat);
          this.vy = Math.min(this.vy + gravity_acc * delta, fall_speed);
          this.vx = mleft ? this.vx > -float_drag_2 * float_multiplier ? Math.max(-float_drag_2 * float_multiplier, this.vx - 2
              * shoefloat) : this.vx : mright ? this.vx < float_drag_2 * float_multiplier ? Math.min(float_drag_2
              * float_multiplier, this.vx + 2 * shoefloat) : this.vx : this.vy < fall_speed ? this.vx > 0 ? Math.max(0.0, this.vx
              - float_coefficient * shoefloat) : Math.min(0.0, this.vx + float_coefficient * shoefloat) : this.vx > 0 ? Math.max(
              0.0, this.vx - shoefloat) : Math.min(0.0, this.vx + shoefloat);
        }
      }
      while (delta > epsilon) {
        if (this.lr) {
        } else if (this.fh) {
          var nx = this.x + this.vx * delta, ny = this.y + this.vy * delta;
          if (nx > this.fh.x2) {
            if (!this.fh.next) {
              nx = this.fh.x2 + epsilon, ny = this.fh.y2;
              this.fh = null;
              delta *= 1 - (nx - this.x) / (this.vx * delta);
            } else if (this.fh.next.x1 < this.fh.next.x2) {
              this.fh = this.fh.next;
              var fx = this.fh.x2 - this.fh.x1, fy = this.fh.y2 - this.fh.y1;
              var dot = (this.vx * fx + this.vy * fy) / (fx * fx + fy * fy);
              nx = this.fh.x1, ny = this.fh.y1;
              delta *= 1 - (nx - this.x) / (this.vx * delta);
              this.vx = dot * fx, this.vy = dot * fy;
            } else if (this.fh.next.y1 > this.fh.next.y2) {
              nx = this.fh.x2 - epsilon, ny = this.fh.y2;
              this.vx = 0, this.vy = 0;
              delta = 0;
            } else {
              nx = this.fh.x2 + epsilon, ny = this.fh.y2;
              this.fh = null;
              delta *= 1 - (nx - this.x) / (this.vx * delta);
            }
          } else if (nx < this.fh.x1) {
            if (!this.fh.prev) {
              nx = this.fh.x1 - epsilon, ny = this.fh.y1;
              this.fh = null;
              delta *= 1 - (nx - this.x) / (this.vx * delta);
            } else if (this.fh.prev.x1 < this.fh.prev.x2) {
              this.fh = this.fh.prev;
              var fx = this.fh.x2 - this.fh.x1, fy = this.fh.y2 - this.fh.y1;
              var dot = (this.vx * fx + this.vy * fy) / (fx * fx + fy * fy);
              nx = this.fh.x2, ny = this.fh.y2;
              delta *= 1 - (nx - this.x) / (this.vx * delta);
              this.vx = dot * fx, this.vy = dot * fy;
            } else if (this.fh.prev.y1 < this.fh.prev.y2) {
              nx = this.fh.x1 + epsilon, ny = this.fh.y1;
              this.vx = 0, this.vy = 0;
              delta = 0;
            } else {
              nx = this.fh.x1 - epsilon, ny = this.fh.y1;
              this.fh = null;
              delta *= 1 - (nx - this.x) / (this.vx * delta);
            }
          } else {
            delta = 0;
          }
          this.x = nx, this.y = ny;
        } else {
          var dx1 = this.vx * delta;
          var dy1 = this.vy * delta;
          var distance = 1;
          var nnx = this.x + dx1;
          var nny = this.y + dy1;
          context.currentMap.allFootholds.forEach(function (f) {
            var dx2 = f.x2 - f.x1;
            var dy2 = f.y2 - f.y1;
            var dx3 = that.x - f.x1;
            var dy3 = that.y - f.y1;
            var denom = dx1 * dy2 - dy1 * dx2;
            var n1 = (dx1 * dy3 - dy1 * dx3) / denom;
            var n2 = (dx2 * dy3 - dy2 * dx3) / denom;
            if (n1 >= 0 && n1 <= 1 && n2 >= 0 && denom < 0 && f != that.djump && n2 <= distance) {
              if (that.group == f.group || dx2 > 0 || f.group == 0 || f.cant_through) {
                nnx = that.x + n2 * dx1, nny = that.y + n2 * dy1;
                distance = n2;
                that.fh = f;
              }
            }
          });
          this.x = nnx;
          this.y = nny;
          if (this.fh) {
            djump = null;
            var fx = this.fh.x2 - this.fh.x1, fy = this.fh.y2 - this.fh.y1;
            if (this.fh.x1 > this.fh.x2) {
              this.y += epsilon;
              this.fh = null;
            } else if (this.fh.x1 == this.fh.x2) {
              if (fy > 0)
                this.x += epsilon;
              else
                this.x -= epsilon;
              this.fh = null;
            } else {
              this.group = this.fh.group;
              this.layer = this.fh.layer;
              if (this.vy > max_land_speed) {
                this.vy = max_land_speed;
              }
            }
            var dot = (this.vx * fx + this.vy * fy) / (fx * fx + fy * fy);
            this.vx = dot * fx, this.vy = dot * fy;
            delta *= 1 - distance;
          } else {
            delta = 0;
          }
        }
      }
    }
  }

})(window);
