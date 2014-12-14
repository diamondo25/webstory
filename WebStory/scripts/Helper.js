(function(context) {

  context.padLeft = function(text, finalLength, string) {
    text = String(text);
    while (text.length < finalLength) {
      text = string + text;
    }
    return text;
  };

  context.padRight = function(text, finalLength, string) {
    text = String(text);
    while (text.length < finalLength) {
      text += string;
    }
    return text;
  };

  context.ksort = function(object) {
    var t = {};
    Object.keys(object).sort().forEach(function(k) {
      t[k] = object[k]
    });
    return t;
  };

  context.getItemType = function getItemType(id) {
    return Math.floor(id / 10000);
  };

  context.getItemInventory = function getItemInventory(id) {
    return Math.floor(id / 1000000);
  };

  var getWZItemTypeName = context.getWZItemTypeName = function(id) {
    var tmp = context.getItemType(id);

    if (id < 10000) {
      return context.padLeft(id, 8, '0') + '.img';
    }

    switch (tmp) {
      case 100:
        return 'Cap';
      case 104:
        return 'Coat';
      case 105:
        return 'Longcoat';
      case 106:
        return 'Pants';
      case 107:
        return 'Shoes';
      case 108:
        return 'Glove';
      case 109:
        return 'Shield';
      case 110:
        return 'Cape';
      case 111:
        return 'Ring';
      case 117:
        return 'MonsterBook';
      case 120:
        return 'Totem';

      case 101:
      case 102:
      case 103:
      case 112:
      case 113:
      case 114:
      case 115:
      case 116:
      case 118:
      case 119:
        return 'Accessory';

      case 121:
      case 122:
      case 123:
      case 124:
      case 130:
      case 131:
      case 132:
      case 133:
      case 134:
      case 135:
      case 136:
      case 137:
      case 138:
      case 139: // FISTFIGHT!!! (sfx: barehands, only 1 item: 1392000)
      case 140:
      case 141:
      case 142:
      case 143:
      case 144:
      case 145:
      case 146:
      case 147:
      case 148:
      case 149:
      case 150:
      case 151:
      case 152:
      case 153:
      case 154: // 1542061 is the only wep, 1532061 is missing... NEXON
      case 155: // Fans of the wall, oh wait
      case 160:
      case 170:
        return 'Weapon';

      case 161:
      case 162:
      case 163:
      case 164:
      case 165:
        return 'Mechanic';

      case 168:
        return 'Bits';

      case 180:
      case 181:
        return 'PetEquip';

      case 184:
      case 185:
      case 186:
      case 187:
      case 188:
      case 189:
        return 'MonsterBattle';

      case 190:
      case 191:
      case 192:
      case 193:
      case 198:
      case 199:
        return 'TamingMob';

      case 194:
      case 195:
      case 196:
      case 197:
        return 'Dragon';

      case 166:
      case 167:
        return 'Android';

      case 996:
        return 'Familiar';
    }
  };

  var getItemDataLocation = context.getItemDataLocation = function GetItemDataLocation(id) {
    var inv = context.getItemInventory(id);
    var type = context.getItemType(id);
    var url = '';
    var location = '';

    if (type == 996) {
      url = location + 'Character.wz/Familiar/' + context.padLeft(id, 7, '0') + '.img/';
    } else if (type < 5) {
      switch (type) {
        case 0:
        case 1:
          url = location + 'Character.wz/' + context.padLeft(id, 8, '0') + '.img/';
          break;
        case 2:
          url = location + 'Character.wz/Face/' + context.padLeft(id, 8, '0') + '.img/';
          break;
        case 3:
          url = location + 'Character.wz/Hair/' + context.padLeft(id, 8, '0') + '.img/';
          break;
      }
    } else if (inv == 1) {
      name = context.getWZItemTypeName(id);
      url = location + 'Character.wz/' + name + '/' + context.padLeft(id, 8, '0') + '.img/';
    } else {
      if (type == 500) {
        url = location + 'Inventory.wz/Pet/' + id + '.img/';
      } else {
        var typeid = context.padLeft(type, 4, '0') + '.img';
        var typename = '';
        switch (Math.floor(type / 100)) {
          case 2:
            typename = 'Consume';
            break;
          case 3:
            typename = 'Install';
            break;
          case 4:
            typename = 'Etc';
            break;
          case 5:
            typename = 'Cash';
            break;
        }
        url = location + 'Inventory.wz/' + typename + '/' + typeid + '/' + context.padLeft(id, 8, '0') + '/';
      }
    }
    return url;
  };

})(window);
