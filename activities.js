// Activities for Little Days.
//
// Each entry has two parts:
// - `rootmap`: copied unchanged from RootMapMVP (https://github.com/vegalh/rootmapmvp),
//   src/data/activities.ts at commit 80cae2e. Titles, ages, descriptions, materials,
//   steps, domains, safety notes and Chinese translations are the original text.
//   `rootmap.image` is the original photo path in that repo.
// - `littleDays`: added for Little Days only, not part of the original activity.
//   minAge/maxAge are read from `rootmap.age`. place, weather, seasons and holidays are
//   Little Days judgements (see PRD.md 7.4–7.5). Holiday tags are holiday-inspired
//   suggestions; the original activities were not written for those holidays.
//   photo is the size of the WebP copy in images/activities/ (null if there is none).
//
// Generated once from RootMapMVP; RootMapMVP itself is not changed or needed at runtime.

const ACTIVITIES = [
  {
    "id": "rolling-in-the-leaves",
    "rootmap": {
      "id": "rolling-in-the-leaves",
      "title": "Rolling in the Leaves",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Movement",
      "topic": "Nature",
      "category": "sensory-movement",
      "minutes": 15,
      "materialsLabel": "1 material",
      "image": "../assets/activities/rolling-in-the-leaves.jpg",
      "description": "Children build gross motor coordination and sensory awareness by rolling, reaching, and playing freely in a pile of fallen leaves.",
      "domains": [
        "Gross Motor Coordination",
        "Sensorial Exploration",
        "Independence"
      ],
      "materials": [
        "A pile of fallen leaves"
      ],
      "steps": [
        "Invite your child to explore the leaves, and name what you see together.",
        "Let your child reach out and touch the leaves with their hands.",
        "Encourage your child to lie down and roll through the pile at their own pace.",
        "Join in and describe the sounds and textures you both notice.",
        "Give your child space to keep playing and repeating as they like."
      ],
      "safety": "Check the pile for sticks, stones and anything sharp first, and skip leaves that are wet or moldy.",
      "keywords": "rolling leaves nature seasons gross motor movement outdoor",
      "settings": [
        "park"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "在落叶中打滚",
        "age": "2–3岁",
        "materialsLabel": "1种材料",
        "description": "孩子们通过在落叶堆中打滚、伸手触摸和自由玩耍，培养大肌肉协调能力和感官意识。",
        "domains": [
          "大肌肉协调",
          "感官探索",
          "独立性"
        ],
        "materials": [
          "一堆落叶"
        ],
        "steps": [
          "邀请孩子一起探索落叶，并说出你们看到的东西。",
          "让孩子伸手用手触摸落叶。",
          "鼓励孩子按自己的节奏躺下并在叶堆中打滚。",
          "一起加入，描述你们注意到的声音和质地。",
          "给孩子空间，让他们按喜欢的方式继续玩耍和重复。"
        ],
        "safety": "先检查落叶堆里有没有树枝、石头或尖锐物品；潮湿或发霉的落叶不要玩。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "outdoor",
      "weather": [
        "cold"
      ],
      "seasons": [
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 640
      }
    }
  },
  {
    "id": "tossing-leaves-with-a-stick",
    "rootmap": {
      "id": "tossing-leaves-with-a-stick",
      "title": "Tossing Leaves with a Stick",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Movement",
      "topic": "Nature",
      "category": "sensory-movement",
      "minutes": 15,
      "materialsLabel": "2 materials",
      "image": "../assets/activities/tossing-leaves-with-a-stick.jpg",
      "description": "Children build gross motor coordination outdoors by using a stick to scoop and toss fallen leaves into the air.",
      "domains": [
        "Gross Motor Coordination",
        "Sensorial Exploration",
        "Nature Awareness"
      ],
      "materials": [
        "A pile of fallen leaves",
        "A sturdy stick, about as long as your child's arm"
      ],
      "steps": [
        "Invite your child to play in the leaves, and find a good stick together.",
        "Show how to hold the stick with two hands and scoop it under the leaves.",
        "Lift and toss the leaves up and watch them fall together.",
        "Let your child try and find their own rhythm.",
        "Notice the sounds and colors of the falling leaves together."
      ],
      "safety": "Choose a stick without sharp points, and remind your child to keep it low and away from other people.",
      "keywords": "tossing leaves stick fall autumn outdoor gross motor movement nature",
      "settings": [
        "park"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "拿棍子扬落叶",
        "age": "2–3岁",
        "materialsLabel": "2种材料",
        "description": "孩子们在户外用棍子把落叶铲起、扬到空中，锻炼大肌肉协调能力。",
        "domains": [
          "大肌肉协调",
          "感官探索",
          "自然认知"
        ],
        "materials": [
          "一堆落叶",
          "一根结实的棍子，长度大约和孩子的手臂一样"
        ],
        "steps": [
          "邀请孩子一起玩落叶，一起找一根合适的棍子。",
          "示范用双手握住棍子，从落叶下面铲进去。",
          "一起把落叶扬起来，看着它们飘落。",
          "让孩子试一试，找到自己的节奏。",
          "一起留意落叶飘下时的声音和颜色。"
        ],
        "safety": "选择没有尖头的棍子，提醒孩子把棍子放低，不要朝向别人。",
        "keywords": "扬落叶 落叶 棍子 秋天 户外 大肌肉 自然"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "outdoor",
      "weather": [
        "cold"
      ],
      "seasons": [
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "duck-walk",
    "rootmap": {
      "id": "duck-walk",
      "title": "Duck Walk",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Movement",
      "topic": "Nature",
      "category": "sensory-movement",
      "minutes": 10,
      "materialsLabel": "1 material",
      "image": "../assets/activities/duck-walk.jpg",
      "description": "Children build leg strength, balance, and coordination by squatting low and waddling forward like a duck.",
      "domains": [
        "Gross Motor Coordination",
        "Balance",
        "Concentration"
      ],
      "materials": [
        "Open outdoor space"
      ],
      "steps": [
        "Invite your child to squat down low like a duck.",
        "Show how to waddle forward while staying low to the ground.",
        "Encourage your child to try a few steps, holding their balance.",
        "Quack together and make it playful as you move.",
        "Give your child space to repeat and waddle as far as they'd like."
      ],
      "keywords": "duck walk squat walking gross motor balance movement outdoor",
      "settings": [
        "walking",
        "park"
      ],
      "materialType": "none",
      "zh": {
        "title": "鸭子走路",
        "age": "2–3岁",
        "materialsLabel": "1种材料",
        "description": "孩子们通过蹲低身体像鸭子一样摇摆前行，培养腿部力量、平衡感和协调能力。",
        "domains": [
          "大肌肉协调",
          "平衡感",
          "专注力"
        ],
        "materials": [
          "开阔的户外空间"
        ],
        "steps": [
          "邀请孩子蹲低身体，像鸭子一样。",
          "示范如何保持低姿势向前摇摆走路。",
          "鼓励孩子尝试走几步，保持平衡。",
          "一起发出鸭子的叫声，让过程充满乐趣。",
          "给孩子空间，让他们按自己喜欢的方式重复练习并走得更远。"
        ]
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "outdoor",
      "weather": [
        "rain",
        "snow",
        "cold",
        "wind"
      ],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 640
      }
    }
  },
  {
    "id": "bark-rubbing",
    "rootmap": {
      "id": "bark-rubbing",
      "title": "Bark Rubbing",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Science",
      "topic": "Nature",
      "category": "nature-culture",
      "minutes": 15,
      "materialsLabel": "2 materials",
      "image": "../assets/activities/bark-rubbing.jpg",
      "description": "Children hold paper against a tree trunk or fallen log and rub with a crayon to reveal the bark's pattern, then compare different trees.",
      "domains": [
        "Nature Awareness",
        "Observation",
        "Fine Motor Coordination"
      ],
      "materials": [
        "Plain paper",
        "Crayons with the paper wrapper removed"
      ],
      "steps": [
        "On a walk, find a tree or fallen log and feel its bark together.",
        "Hold the paper flat against the bark, or help your child hold it.",
        "Show how to rub the side of the crayon back and forth until the pattern appears.",
        "Let your child make a rubbing, then try another tree with a different color.",
        "Lay the rubbings side by side and talk about which bark is rough, smooth, lined or bumpy."
      ],
      "keywords": "bark rubbing tree trunk crayon texture pattern nature walk outdoor",
      "safety": "Check the bark for insects, sap and thorns first, and choose a fallen log only if it's stable.",
      "settings": [
        "walking",
        "park"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "树皮拓印",
        "age": "2–6岁",
        "materialsLabel": "2种材料",
        "description": "孩子们把纸贴在树干或倒下的木头上，用蜡笔来回涂，拓出树皮的纹路，再比较不同的树。",
        "domains": [
          "自然认知",
          "观察力",
          "精细动作协调"
        ],
        "materials": [
          "白纸",
          "撕掉包装纸的蜡笔"
        ],
        "steps": [
          "散步时找一棵树或一根倒下的木头，一起摸摸树皮。",
          "把纸平贴在树皮上，或帮孩子一起按住。",
          "示范用蜡笔侧面来回涂，直到纹路显现出来。",
          "让孩子拓一张，再换一棵树、换个颜色试试。",
          "把拓印并排放好，聊聊哪种树皮粗糙、光滑，有条纹还是凹凸不平。"
        ],
        "keywords": "树皮拓印 树干 蜡笔 纹路 质感 自然 散步 户外",
        "safety": "先检查树皮上有没有虫子、树汁和刺；只选稳当的倒木。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "outdoor",
      "weather": [
        "cold"
      ],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "egg-carton-nature-hunt",
    "rootmap": {
      "id": "egg-carton-nature-hunt",
      "title": "Egg Carton Nature Hunt",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Science",
      "topic": "Nature",
      "category": "nature-culture",
      "minutes": 20,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/egg-carton-nature-hunt.jpg",
      "description": "Children search outside for a rock, a leaf, a pinecone and more, matching each find to a simple picture and placing it in its own egg-carton cup.",
      "domains": [
        "Nature Awareness",
        "Vocabulary",
        "Observation",
        "Order"
      ],
      "materials": [
        "Empty egg carton",
        "Paper and a pen for a simple picture list",
        "Things found outside: rock, leaf, stick, bark, flower, seed, grass and more"
      ],
      "steps": [
        "Before you go, draw a simple picture and write a word for each thing to find, and tuck the list inside the lid.",
        "Walk together and name the first picture on the list.",
        "Help your child look for it, then place it in its own cup.",
        "Let your child lead the search for the next ones, naming each find as it goes in.",
        "When the carton is full, sit down together and talk about how each find looks, feels and smells."
      ],
      "keywords": "scavenger hunt egg carton nature walk collect rock leaf pinecone vocabulary outdoor",
      "safety": "Acorns, seeds and small stones are choking hazards for young children: stay close and keep finds out of mouths. Skip mushrooms and berries, and wash hands afterwards.",
      "settings": [
        "walking",
        "park"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "蛋托自然寻宝",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们在户外寻找石头、树叶、松果等，对照简单的图片，把每样找到的东西放进蛋托的一个小格里。",
        "domains": [
          "自然认知",
          "词汇",
          "观察力",
          "秩序感"
        ],
        "materials": [
          "空蛋托",
          "画寻宝清单的纸和笔",
          "户外找到的东西：石头、树叶、树枝、树皮、花、种子、小草等"
        ],
        "steps": [
          "出门前，为每样要找的东西画一个简单的图并写上名字，把清单夹在盖子里。",
          "一起散步，先说出清单上第一个图的名字。",
          "帮孩子找到它，放进一个小格里。",
          "让孩子带头找接下来的东西，每放一样就说出它的名字。",
          "装满后一起坐下来，聊聊每样东西的样子、手感和气味。"
        ],
        "keywords": "寻宝 蛋托 自然 散步 收集 石头 树叶 松果 词汇 户外",
        "safety": "橡果、种子和小石子对幼儿有窒息风险：请待在旁边，别让孩子放进嘴里。不要采蘑菇和浆果，结束后洗手。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "outdoor",
      "weather": [
        "cold",
        "wind"
      ],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "nature-bracelet",
    "rootmap": {
      "id": "nature-bracelet",
      "title": "Nature Bracelet",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Science",
      "topic": "Nature",
      "category": "nature-culture",
      "minutes": 15,
      "materialsLabel": "2 materials",
      "image": "../assets/activities/nature-bracelet.jpg",
      "description": "Children wear a loop of clear tape, sticky side out, and decorate it with small flowers and leaves they find, noticing colors and shapes along the way.",
      "domains": [
        "Nature Awareness",
        "Fine Motor Control",
        "Creativity"
      ],
      "materials": [
        "Wide clear tape (packing tape)",
        "Small flowers, leaves and grasses found outside"
      ],
      "steps": [
        "Wrap a loop of tape loosely around your child's wrist, sticky side out, and press the ends together.",
        "Walk together and look for small flowers, leaves and grasses on the ground or in your own garden.",
        "Show how to press one find gently onto the sticky tape.",
        "Let your child choose and add more, talking about the colors and shapes they pick.",
        "Look at the finished bracelet together, then slip it off and keep it or put it on a window."
      ],
      "keywords": "nature bracelet tape flowers leaves walk collect outdoor craft garden",
      "safety": "Keep the loop loose. Pick only from your own garden or what has already fallen, never mushrooms or berries, and keep plants out of mouths.",
      "settings": [
        "walking",
        "park",
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "自然手环",
        "age": "2–6岁",
        "materialsLabel": "2种材料",
        "description": "孩子们在手腕上戴一圈黏面朝外的透明胶带，把找到的小花小叶贴上去，一边贴一边观察颜色和形状。",
        "domains": [
          "自然认知",
          "精细动作控制",
          "创造力"
        ],
        "materials": [
          "宽透明胶带（封箱胶带）",
          "户外找到的小花、树叶和小草"
        ],
        "steps": [
          "把胶带黏面朝外，松松地在孩子手腕上绕一圈，两端粘在一起。",
          "一起散步，在地上或自家花园里找小花、树叶和小草。",
          "示范把找到的东西轻轻按在胶带上。",
          "让孩子自己挑选、继续贴，聊聊他选的颜色和形状。",
          "一起欣赏做好的手环，再把它取下来留作纪念，或贴在窗户上。"
        ],
        "keywords": "自然手环 胶带 小花 树叶 散步 收集 户外 手工 花园",
        "safety": "胶带要绕得松一些。只采自家花园里的或已经掉落的，不要采蘑菇和浆果，也别让孩子把植物放进嘴里。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "outdoor",
      "weather": [],
      "seasons": [
        "spring",
        "summer",
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "statue-game",
    "rootmap": {
      "id": "statue-game",
      "title": "Statue Game",
      "age": "3–6 years",
      "ageKey": "3–6",
      "area": "Movement",
      "topic": "Sensory Exploration",
      "category": "sensory-movement",
      "minutes": 5,
      "materialsLabel": "No materials",
      "image": "../assets/activities/statue-game.jpg",
      "description": "When you say \"Statue!\", your child freezes in place until you say \"Go.\" Holding still on purpose is real practice in body control.",
      "domains": [
        "Self-Regulation",
        "Balance",
        "Gross Motor Coordination"
      ],
      "materials": [],
      "steps": [
        "Explain the game: \"When I say 'Statue!', freeze like a statue until I say 'Go.'\"",
        "Start with short freezes while you count slowly to three.",
        "Try statues with a shape, like arms up, hands on your head or standing on one foot.",
        "Make the freezes a little longer as your child gets steadier.",
        "Let your child call \"Statue!\" for you."
      ],
      "keywords": "statue freeze game waiting body control balance",
      "safety": "Play only where your child can stand still safely, away from traffic, doors and moving carts.",
      "settings": [
        "waiting",
        "park",
        "home"
      ],
      "materialType": "none",
      "zh": {
        "title": "木头人",
        "age": "3–6岁",
        "materialsLabel": "无需材料",
        "description": "你说“木头人！”，孩子就原地定住，直到你说“动”。有意识地保持不动，是在真正地练习控制身体。",
        "domains": [
          "自我调节",
          "平衡感",
          "大肌肉协调"
        ],
        "materials": [],
        "steps": [
          "先说好规则：“我说‘木头人！’，你就像雕像一样定住，等我说‘动’再动。”",
          "一开始只定一小会儿，你慢慢数到三。",
          "试试摆个造型再定住：举起双手、手放头上、单脚站。",
          "孩子越来越稳了，就让定住的时间长一点。",
          "换孩子来喊“木头人！”，你来定住。"
        ],
        "keywords": "木头人 定住 游戏 排队 身体控制 平衡",
        "safety": "只在孩子可以安全站定的地方玩，远离车辆、门口和推车。"
      }
    },
    "littleDays": {
      "minAge": 3,
      "maxAge": 6,
      "place": "either",
      "weather": [
        "rain",
        "snow",
        "cold",
        "wind"
      ],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "leaf-rubbing",
    "rootmap": {
      "id": "leaf-rubbing",
      "title": "Leaf Rubbing",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Nature",
      "category": "nature-culture",
      "minutes": 15,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/leaf-rubbing.jpg",
      "description": "Children discover the veins of a leaf by laying paper over it and rubbing with a crayon until the pattern appears.",
      "domains": [
        "Creativity",
        "Nature Awareness",
        "Fine Motor Coordination"
      ],
      "materials": [
        "Fresh leaves",
        "White paper",
        "Crayons with the paper wrapper removed",
        "Board or tray"
      ],
      "steps": [
        "Invite your child to collect a few leaves, and feel the veins on the back together.",
        "Place a leaf vein-side up on the board and lay the paper over it.",
        "Show how to hold the paper still with one hand and rub the side of the crayon over the leaf.",
        "Let your child rub until the whole leaf appears, then try another leaf or color.",
        "Compare the rubbings with the real leaves together."
      ],
      "keywords": "leaf rubbing crayon rubbing leaves veins nature art fall autumn",
      "settings": [
        "home",
        "park"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "树叶拓印",
        "age": "2–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们把纸盖在树叶上，用蜡笔来回涂，让叶脉的纹路慢慢显现出来。",
        "domains": [
          "创造力",
          "自然认知",
          "精细动作协调"
        ],
        "materials": [
          "新鲜树叶",
          "白纸",
          "撕掉包装纸的蜡笔",
          "垫板或托盘"
        ],
        "steps": [
          "邀请孩子一起捡几片树叶，摸一摸叶子背面的叶脉。",
          "把树叶叶脉朝上放在垫板上，再盖上白纸。",
          "示范一只手按住纸，另一只手用蜡笔侧面在树叶上来回涂。",
          "让孩子一直涂到整片叶子显现出来，再换一片叶子或换个颜色试试。",
          "一起把拓印和真树叶比一比。"
        ],
        "keywords": "树叶拓印 拓印 蜡笔 树叶 叶脉 自然 美术 秋天"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "either",
      "weather": [],
      "seasons": [
        "spring",
        "summer",
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 714
      }
    }
  },
  {
    "id": "water-painting-stones",
    "rootmap": {
      "id": "water-painting-stones",
      "title": "Water Painting on Stones",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Nature",
      "category": "art-creativity",
      "minutes": 15,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/water-painting-stones.jpg",
      "description": "Children paint on smooth stones with plain water and watch their pictures dry and disappear, then paint again.",
      "domains": [
        "Creativity",
        "Fine Motor Control",
        "Nature Awareness"
      ],
      "materials": [
        "A few smooth, palm-sized stones from the garden, park or beach",
        "Cup of water",
        "Paintbrush (or a fingertip)"
      ],
      "steps": [
        "Collect a few smooth stones together, and notice their colors and how they feel.",
        "Set the stones on a table or low wall with a cup of water.",
        "Show how to dip the brush in the water and paint a line or a shape on a stone.",
        "Let your child paint anything they like, and watch together as the water darkens the stone.",
        "Wait for the picture to dry and disappear, then paint the stone again."
      ],
      "keywords": "water painting stones rocks paintbrush outdoor nature art disappearing",
      "safety": "Choose stones bigger than your child's fist so they can't go in mouths, and stay close if your child likes to throw things.",
      "settings": [
        "home",
        "park"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "石头上的水画",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们用清水在光滑的石头上画画，看着画慢慢变干、消失，再接着画。",
        "domains": [
          "创造力",
          "精细动作控制",
          "自然认知"
        ],
        "materials": [
          "几块手掌大小的光滑石头（花园、公园或海边捡的）",
          "一杯清水",
          "画笔（或用手指）"
        ],
        "steps": [
          "和孩子一起捡几块光滑的石头，看看它们的颜色，摸摸它们的手感。",
          "把石头和一杯水放在桌子或矮墙上。",
          "示范用画笔蘸水，在石头上画一条线或一个形状。",
          "让孩子随意画，一起看清水把石头染深的样子。",
          "等画干了、消失了，再在石头上画一次。"
        ],
        "keywords": "水画 石头 画笔 户外 自然 美术 消失",
        "safety": "选比孩子拳头大的石头，避免放进嘴里；如果孩子喜欢扔东西，请待在旁边。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "either",
      "weather": [
        "hot"
      ],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "whats-that-sound",
    "rootmap": {
      "id": "whats-that-sound",
      "title": "What's That Sound?",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Science",
      "topic": "Sensory Exploration",
      "category": "sensory-movement",
      "minutes": 5,
      "materialsLabel": "No materials",
      "image": "../assets/activities/whats-that-sound.jpg",
      "description": "Be very still together and listen. Name one sound at a time and try to find where it comes from. It slows a restless moment down.",
      "domains": [
        "Listening",
        "Concentration",
        "Self-Regulation"
      ],
      "materials": [],
      "steps": [
        "Say quietly, \"Let's be very still and listen.\"",
        "Look down or close your eyes and take two slow breaths together.",
        "Whisper one sound you hear, such as a door, a cart or a bird.",
        "Open your eyes and try to find what made it.",
        "See how many different sounds you can find."
      ],
      "keywords": "listening sounds quiet still waiting calm",
      "settings": [
        "waiting",
        "restaurant",
        "walking",
        "park",
        "airplane",
        "train",
        "home"
      ],
      "materialType": "none",
      "zh": {
        "title": "那是什么声音？",
        "age": "2–6岁",
        "materialsLabel": "无需材料",
        "description": "一起安静下来，认真听。一次说出一种声音，再找找它从哪里来。能让焦躁的时刻慢下来。",
        "domains": [
          "倾听能力",
          "专注力",
          "自我调节"
        ],
        "materials": [],
        "steps": [
          "轻声说：“我们安静下来，听一听。”",
          "低头或闭上眼睛，一起慢慢深呼吸两次。",
          "小声说出听到的一种声音：关门声、推车声、鸟叫声……",
          "睁开眼睛，找找是什么发出的声音。",
          "数数一共能听到几种不同的声音。"
        ],
        "keywords": "听声音 倾听 安静 等待 平静"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "either",
      "weather": [
        "rain",
        "snow",
        "cold",
        "hot",
        "wind"
      ],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "i-spy-a-color",
    "rootmap": {
      "id": "i-spy-a-color",
      "title": "I Spy a Color",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Language",
      "topic": "Language Development",
      "category": "language",
      "minutes": 5,
      "materialsLabel": "No materials",
      "image": "../assets/activities/i-spy-a-color.jpg",
      "description": "A quiet looking game for any line: one person picks something nearby and names only its color, and the other searches with their eyes until they find it.",
      "domains": [
        "Observation",
        "Vocabulary",
        "Concentration"
      ],
      "materials": [],
      "steps": [
        "Look around together and quietly choose one thing you can both see.",
        "Say, \"I spy something… red,\" naming only its color.",
        "Let your child look and point. Offer one small hint if they want it, such as \"It's up high.\"",
        "Swap: your child chooses something and tells you its color.",
        "Stop while it's still fun, after three or four rounds."
      ],
      "keywords": "i spy color looking game waiting line observation",
      "settings": [
        "waiting",
        "restaurant",
        "grocery",
        "walking",
        "park",
        "airplane",
        "train"
      ],
      "materialType": "none",
      "zh": {
        "title": "我发现一种颜色",
        "age": "2–6岁",
        "materialsLabel": "无需材料",
        "description": "一个适合任何排队时刻的安静观察游戏：一个人悄悄选中身边的一样东西，只说出它的颜色，另一个人用眼睛找，直到找到为止。",
        "domains": [
          "观察力",
          "词汇量",
          "专注力"
        ],
        "materials": [],
        "steps": [
          "一起看看四周，悄悄选一样你们都能看到的东西。",
          "说：“我发现了一样……红色的东西”，只说颜色。",
          "让孩子用眼睛找、用手指一指。孩子需要的话，给一个小提示，比如“它在高处”。",
          "交换角色：让孩子选一样东西，告诉你它的颜色。",
          "玩三四轮，在孩子还觉得好玩的时候停下来。"
        ],
        "keywords": "我发现 颜色 观察 排队 等待 游戏"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "either",
      "weather": [
        "rain",
        "snow",
        "cold",
        "hot",
        "wind"
      ],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "orange-peeling",
    "rootmap": {
      "id": "orange-peeling",
      "title": "Orange Peeling",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/orange-peeling.jpg",
      "description": "Children practice food preparation and finger strength by peeling a small orange and placing the peel in a basket.",
      "domains": [
        "Food Preparation",
        "Fine Motor Coordination",
        "Concentration"
      ],
      "materials": [
        "Mandarin orange",
        "Bowl",
        "Basket for the peel",
        "Tray"
      ],
      "steps": [
        "Invite your child to try peeling an orange, and name the materials together.",
        "Show how to press a thumb into the top of the orange to start the peel.",
        "Peel off one small piece at a time and place it in the basket.",
        "Let your child try, offering a small start in the peel if needed.",
        "Separate the segments together and enjoy them."
      ],
      "keywords": "orange mandarin peeling food preparation practical life fruit snack",
      "settings": [
        "home",
        "airplane",
        "train",
        "park"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "剥橘子",
        "age": "2–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们剥开一个小橘子，把橘子皮放进篮子里，练习食物准备能力和手指力量。",
        "domains": [
          "食物准备",
          "精细动作协调",
          "专注力"
        ],
        "materials": [
          "小橘子",
          "碗",
          "放皮的小篮子",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起试试剥橘子，并说出材料的名称。",
          "示范用拇指按进橘子顶部，开始剥皮。",
          "一次剥下一小块皮，放进篮子里。",
          "让孩子尝试，需要时可以先帮孩子剥开一个小口。",
          "一起把橘子分成一瓣一瓣，享用吧。"
        ],
        "keywords": "剥橘子 橘子 橙子 剥皮 水果 食物准备"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "either",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 877
      }
    }
  },
  {
    "id": "gluing-leaves-to-trees",
    "rootmap": {
      "id": "gluing-leaves-to-trees",
      "title": "Gluing Leaves to Trees",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Seasons",
      "category": "art-creativity",
      "minutes": 15,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/gluing-leaves-to-trees.jpg",
      "description": "Children practice fine motor control and learn about the seasons by gluing real fallen leaves onto the branches of a tree drawing.",
      "domains": [
        "Fine Motor Coordination",
        "Creativity",
        "Nature Awareness"
      ],
      "materials": [
        "Paper with a bare tree drawn on it",
        "Dry fallen leaves in a tray",
        "Glue stick"
      ],
      "steps": [
        "Invite your child to give the tree its leaves, and name the materials together.",
        "Show how to rub the glue stick on a branch of the tree.",
        "Choose a leaf and press it onto the glue together.",
        "Let your child keep adding leaves wherever they like.",
        "Let the picture dry, then talk about the colors of the leaves."
      ],
      "keywords": "gluing leaves tree fall autumn seasons collage glue stick nature art",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "给大树贴叶子",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们把真的落叶贴到画好的大树枝干上，练习精细动作，也认识季节变化。",
        "domains": [
          "精细动作协调",
          "创造力",
          "自然认知"
        ],
        "materials": [
          "画着光秃秃大树的纸",
          "放在托盘里的干落叶",
          "胶棒"
        ],
        "steps": [
          "邀请孩子一起给大树贴上叶子，并说出材料的名称。",
          "示范在一根树枝上涂胶棒。",
          "一起选一片叶子，按在涂了胶的地方。",
          "让孩子按自己的想法继续贴叶子。",
          "让画晾干，再一起聊聊叶子的颜色。"
        ],
        "keywords": "贴叶子 大树 落叶 秋天 季节 胶棒 拼贴 自然"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": [
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "fall-gluing",
    "rootmap": {
      "id": "fall-gluing",
      "title": "Fall Gluing",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Seasons",
      "category": "art-creativity",
      "minutes": 15,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/fall-gluing.jpg",
      "description": "Children make an autumn collage by gluing pictures of fall fruits and real dry leaves onto colored paper.",
      "domains": [
        "Fine Motor Coordination",
        "Creativity",
        "Nature Awareness"
      ],
      "materials": [
        "Cut-out pictures of fall fruits",
        "Dry fallen leaves",
        "Glue bottle or glue stick",
        "Colored background paper"
      ],
      "steps": [
        "Invite your child to make a fall picture, and name the fruits and leaves together.",
        "Show how to squeeze a small dot of glue onto the paper.",
        "Press a fruit picture or a leaf onto the glue together.",
        "Let your child choose and glue the rest.",
        "Let the collage dry, then name the fall fruits together."
      ],
      "keywords": "fall gluing autumn collage fruits leaves glue seasons art",
      "settings": [
        "home"
      ],
      "zh": {
        "title": "秋天拼贴",
        "age": "2–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们把秋季水果图片和真的干落叶贴到彩色纸上，做一幅秋天拼贴画。",
        "domains": [
          "精细动作协调",
          "创造力",
          "自然认知"
        ],
        "materials": [
          "剪好的秋季水果图片",
          "干落叶",
          "胶水瓶或胶棒",
          "彩色底纸"
        ],
        "steps": [
          "邀请孩子一起做一幅秋天的画，并说出水果和叶子的名称。",
          "示范在纸上挤一小点胶水。",
          "一起把水果图片或叶子按在胶水上。",
          "让孩子自己选择并粘贴剩下的。",
          "让拼贴画晾干，再一起说说秋天的水果。"
        ],
        "keywords": "秋天 拼贴 粘贴 水果 落叶 胶水 季节 美术"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": [
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "drawing-the-other-half",
    "rootmap": {
      "id": "drawing-the-other-half",
      "title": "Drawing the Other Half of a Leaf",
      "age": "3–6 years",
      "ageKey": "3–6",
      "area": "Art",
      "topic": "Nature",
      "category": "art-creativity",
      "minutes": 15,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/drawing-the-other-half.jpg",
      "description": "Children glue half a real leaf onto paper and draw the missing half, looking closely at its outline, veins and colors.",
      "domains": [
        "Observation",
        "Creativity",
        "Fine Motor Control",
        "Nature Awareness"
      ],
      "materials": [
        "Fallen leaves of different shapes",
        "Paper",
        "Glue stick",
        "Marker and crayons"
      ],
      "steps": [
        "Collect a few flat leaves together; an adult cuts each one in half along the middle vein.",
        "Let your child choose a half and glue it onto the paper, with the cut edge in the middle.",
        "Look together at the leaf's edge, its veins and its colors.",
        "Invite your child to draw the outline and veins of the missing half with the marker.",
        "Color in the drawn half with crayons, then compare it with the real half."
      ],
      "keywords": "leaf half drawing symmetry mirror leaves veins nature art draw",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "画出叶子的另一半",
        "age": "3–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们把半片真树叶贴在纸上，画出缺少的另一半，仔细观察叶子的轮廓、叶脉和颜色。",
        "domains": [
          "观察力",
          "创造力",
          "精细动作控制",
          "自然认知"
        ],
        "materials": [
          "各种形状的落叶",
          "白纸",
          "固体胶",
          "马克笔和蜡笔"
        ],
        "steps": [
          "和孩子一起捡几片平整的树叶，由大人沿着中间的叶脉把每片剪成两半。",
          "让孩子挑一半，切口朝中间贴在纸上。",
          "一起看看叶子的边缘、叶脉和颜色。",
          "请孩子用马克笔画出另一半的轮廓和叶脉。",
          "用蜡笔给画出来的一半涂色，再和真叶子比一比。"
        ],
        "keywords": "画另一半 对称 树叶 叶脉 自然 美术 画画"
      }
    },
    "littleDays": {
      "minAge": 3,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": [
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "nature-prints-in-dough",
    "rootmap": {
      "id": "nature-prints-in-dough",
      "title": "Nature Prints in Playdough",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Sensory Exploration",
      "category": "sensory-movement",
      "minutes": 15,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/nature-prints-in-dough.jpg",
      "description": "Children press pinecones, leaves and seed pods into flattened playdough and explore the patterns each one leaves behind.",
      "domains": [
        "Sensory Exploration",
        "Fine Motor Control",
        "Nature Awareness"
      ],
      "materials": [
        "Playdough (store-bought or homemade from flour, salt, water and oil)",
        "Pinecones, leaves and seed pods collected outside",
        "Board or tray"
      ],
      "steps": [
        "Collect a few pinecones, leaves and seed pods together on a walk.",
        "Show how to flatten the playdough on the board with your palms.",
        "Press one natural object into the dough, lift it, and look at the print together.",
        "Let your child press, roll and stamp the other objects to find new patterns.",
        "Talk about which prints are bumpy, lined or spiky, then squash the dough flat and start again."
      ],
      "keywords": "playdough play dough pinecone print pattern texture nature sensory",
      "safety": "Small pinecones, seeds and nuts can be choking hazards: choose large pieces and stay close. Playdough is not for eating.",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "彩泥上的自然印记",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们把松果、树叶和种荚压进压平的彩泥里，探索每样东西留下的不同纹路。",
        "domains": [
          "感官探索",
          "精细动作控制",
          "自然认知"
        ],
        "materials": [
          "彩泥（买的，或用面粉、盐、水和油自制）",
          "在户外捡的松果、树叶和种荚",
          "垫板或托盘"
        ],
        "steps": [
          "散步时和孩子一起捡几个松果、几片树叶和种荚。",
          "示范用手掌把彩泥在垫板上压平。",
          "把一样自然物压进彩泥里再拿起来，一起看看留下的印记。",
          "让孩子用其他东西按、滚、压，找出新的纹路。",
          "聊聊哪些印记是凹凸的、条纹的或尖尖的，再把彩泥压平重新开始。"
        ],
        "keywords": "彩泥 橡皮泥 松果 印记 纹路 质感 自然 感官",
        "safety": "小松果、种子和坚果有窒息风险：请选大一些的，并待在孩子身边。彩泥不能吃。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "pinecone-rolling-painting",
    "rootmap": {
      "id": "pinecone-rolling-painting",
      "title": "Pinecone Rolling Painting",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Creativity",
      "category": "art-creativity",
      "minutes": 15,
      "materialsLabel": "5 materials",
      "image": "../assets/activities/pinecone-rolling-painting.jpg",
      "description": "Children roll paint-dipped pinecones across paper in a tray, discovering the colorful patterns the scales leave behind.",
      "domains": [
        "Creativity",
        "Hand-Eye Coordination",
        "Sensory Exploration"
      ],
      "materials": [
        "A few pinecones collected outside",
        "Washable paint in a few colors",
        "Paper",
        "Tray or shallow box",
        "Cloth for wiping hands"
      ],
      "steps": [
        "Lay the paper flat in the tray, and put a little of each paint color in a dish.",
        "Show how to roll a pinecone in one color until it's coated.",
        "Place it on the paper and tilt the tray, or push the pinecone with a finger, so it rolls across.",
        "Let your child add more pinecones and colors, and watch the patterns cross and mix.",
        "Lift out the pinecones, wipe hands with the cloth, and let the painting dry."
      ],
      "keywords": "pinecone painting rolling paint tray print pattern art nature",
      "safety": "Use washable, non-toxic paint, and keep pinecones and paint away from mouths.",
      "settings": [
        "home"
      ],
      "zh": {
        "title": "松果滚画",
        "age": "2–6岁",
        "materialsLabel": "5种材料",
        "description": "孩子们把蘸了颜料的松果放在托盘里的纸上滚动，发现松果鳞片留下的彩色纹路。",
        "domains": [
          "创造力",
          "手眼协调",
          "感官探索"
        ],
        "materials": [
          "几个户外捡的松果",
          "几种颜色的可水洗颜料",
          "白纸",
          "托盘或浅盒子",
          "擦手的布"
        ],
        "steps": [
          "把纸平铺在托盘里，每种颜料倒一点在小碟子里。",
          "示范把松果在一种颜料里滚一滚，让它沾满颜色。",
          "把松果放在纸上，倾斜托盘或用手指推一推，让它滚过去。",
          "让孩子加入更多松果和颜色，看纹路交错混合。",
          "把松果拿出来，用布擦干净手，等画晾干。"
        ],
        "keywords": "松果 滚画 颜料 托盘 印画 纹路 美术 自然",
        "safety": "请使用可水洗、无毒的颜料，别让孩子把松果和颜料放进嘴里。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 1106
      }
    }
  },
  {
    "id": "exploring-fall-vegetables",
    "rootmap": {
      "id": "exploring-fall-vegetables",
      "title": "Exploring Fall Vegetables",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Seasons",
      "category": "sensory-movement",
      "minutes": 10,
      "materialsLabel": "5 materials",
      "image": "../assets/activities/exploring-fall-vegetables.jpg",
      "description": "Children use their senses to explore a tray of fall vegetables, noticing their shapes, textures, and weight.",
      "domains": [
        "Sensorial Exploration",
        "Language Development",
        "Concentration"
      ],
      "materials": [
        "Small pumpkin",
        "Sweet potato",
        "Onion",
        "Carrot",
        "Tray"
      ],
      "steps": [
        "Invite your child to explore the tray of vegetables, and name each one together.",
        "Let your child pick up and hold each vegetable one at a time.",
        "Describe what you both notice about its shape, color, and texture.",
        "Encourage your child to compare the vegetables to one another.",
        "Give your child space to keep exploring at their own pace."
      ],
      "keywords": "fall vegetables seasons sensorial exploration onion pumpkin scallions",
      "settings": [
        "home",
        "grocery"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "探索秋季蔬菜",
        "age": "2–6岁",
        "materialsLabel": "5种材料",
        "description": "孩子们通过感官探索一盘秋季蔬菜，感受它们的形状、质地和重量。",
        "domains": [
          "感官探索",
          "语言发展",
          "专注力"
        ],
        "materials": [
          "小南瓜",
          "红薯",
          "洋葱",
          "胡萝卜",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起探索这盘蔬菜，并说出每种蔬菜的名称。",
          "让孩子一次拿起并感受一种蔬菜。",
          "一起描述你们注意到的形状、颜色和质地。",
          "鼓励孩子比较不同的蔬菜。",
          "给孩子空间，让他们按自己的节奏继续探索。"
        ]
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": [
        "autumn"
      ],
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "washing-pumpkin",
    "rootmap": {
      "id": "washing-pumpkin",
      "title": "Washing a Pumpkin",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Everyday Life",
      "category": "practical-life",
      "minutes": 15,
      "materialsLabel": "5 materials",
      "image": "../assets/activities/washing-pumpkin.jpg",
      "description": "Children spray, scrub, and dry a pumpkin, building coordination, sequencing, and care for the things around them.",
      "domains": [
        "Care of Environment",
        "Sequencing",
        "Gross Motor Coordination",
        "Concentration"
      ],
      "materials": [
        "Small pumpkin",
        "Tub",
        "Spray bottle of water",
        "Brush",
        "Cloths"
      ],
      "steps": [
        "Invite your child to wash the pumpkin, and name the materials together.",
        "Show how to spray water all over the pumpkin.",
        "Demonstrate scrubbing gently with the brush, turning the pumpkin as you go.",
        "Dry the pumpkin together with the cloth.",
        "Let your child try, and repeat as many times as they'd like."
      ],
      "safety": "Stay with your child whenever water is out, even a small basin, and wipe up spills so the floor isn't slippery.",
      "keywords": "washing pumpkin scrubbing fall care of environment practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "洗南瓜",
        "keywords": "洗 南瓜 刷 秋天 喷水",
        "age": "2–3岁",
        "materialsLabel": "5种材料",
        "description": "孩子们给南瓜喷水、刷洗再擦干，培养协调能力、顺序感，以及照顾身边事物的意识。",
        "domains": [
          "照顾环境",
          "顺序感",
          "大肌肉协调",
          "专注力"
        ],
        "materials": [
          "小南瓜",
          "盆",
          "装水的喷壶",
          "刷子",
          "布"
        ],
        "steps": [
          "邀请孩子一起洗南瓜，并说出材料的名称。",
          "示范如何把水喷遍整个南瓜。",
          "展示用刷子轻轻刷洗，一边刷一边转动南瓜。",
          "一起用布把南瓜擦干。",
          "让孩子尝试，并按自己的节奏重复练习。"
        ],
        "safety": "只要有水，即使是一小盆，也请始终陪在孩子身边，并及时擦干洒出的水，以免地面湿滑。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "indoor",
      "weather": [],
      "seasons": [
        "autumn"
      ],
      "holidays": [
        "Halloween"
      ],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "dotting",
    "rootmap": {
      "id": "dotting",
      "title": "Dotting",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Creativity",
      "category": "art-creativity",
      "minutes": 12,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/dotting.jpg",
      "description": "Children explore mark-making and fine motor control by pressing a sponge brush onto paper.",
      "domains": [
        "Fine Motor Coordination",
        "Creativity",
        "Concentration"
      ],
      "materials": [
        "Sponge brush or cotton swab",
        "Paint",
        "Paper",
        "Tray"
      ],
      "steps": [
        "Invite your child to try dotting, and name the materials together.",
        "Show how to dip the sponge brush in one color and press it onto the paper to make a dot.",
        "Lift and move to a new spot for the next dot.",
        "Let your child try.",
        "Give your child space to explore and repeat freely."
      ],
      "keywords": "dotting painting fine motor art creativity",
      "settings": [
        "home"
      ],
      "zh": {
        "title": "点画",
        "age": "2–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们通过用海绵刷在纸上按压，探索标记制作和精细动作控制。",
        "domains": [
          "精细动作协调",
          "创造力",
          "专注力"
        ],
        "materials": [
          "海绵刷或棉签",
          "颜料",
          "纸",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起试试点画，并说出材料的名称。",
          "示范把海绵刷蘸一种颜色，按在纸上点出一个圆点。",
          "抬起并移动到新的位置点下一个点。",
          "让孩子尝试。",
          "给孩子空间自由探索和重复练习。"
        ]
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "paper-collage",
    "rootmap": {
      "id": "paper-collage",
      "title": "Paper Collage",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Creativity",
      "category": "art-creativity",
      "minutes": 15,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/paper-collage.jpg",
      "description": "Children practice fine motor control and composition by gluing paper pieces onto a background.",
      "domains": [
        "Fine Motor Coordination",
        "Creativity",
        "Concentration"
      ],
      "materials": [
        "Glue stick",
        "Paper pieces",
        "Background paper"
      ],
      "steps": [
        "Invite your child to try this collage activity, and name the materials together.",
        "Show how to rub the glue stick on the back of a paper piece.",
        "Press the piece onto the background paper together.",
        "Let your child try with the remaining pieces.",
        "Let the collage dry undisturbed."
      ],
      "keywords": "paper collage glue art creativity fine motor",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "纸张拼贴",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们通过将纸片粘贴到背景纸上，练习精细动作控制和构图能力。",
        "domains": [
          "精细动作协调",
          "创造力",
          "专注力"
        ],
        "materials": [
          "胶棒",
          "纸片",
          "背景纸"
        ],
        "steps": [
          "邀请孩子一起试试纸张拼贴，并说出材料的名称。",
          "示范在纸片背面涂抹胶棒。",
          "一起将纸片按压到背景纸上。",
          "让孩子尝试粘贴剩余的纸片。",
          "让拼贴画不受打扰地晾干。"
        ]
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 877
      }
    }
  },
  {
    "id": "finger-painting-stamping",
    "rootmap": {
      "id": "finger-painting-stamping",
      "title": "Finger Painting and Stamping",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Art",
      "topic": "Creativity",
      "category": "art-creativity",
      "minutes": 15,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/finger-painting-stamping.jpg",
      "description": "Children explore color and texture by pressing their hands and a stamp into paint and printing onto paper.",
      "domains": [
        "Sensorial Exploration",
        "Creativity",
        "Fine Motor Coordination"
      ],
      "materials": [
        "Washable paint",
        "Paper",
        "Celery or bok choy base",
        "Plate"
      ],
      "steps": [
        "Invite your child to try painting with their hands, and name the materials together.",
        "Show how to press a hand flat into the paint and then onto the paper.",
        "Dip the celery or bok choy base in the paint and press it onto the paper together, then lift it to see the flower.",
        "Let your child print, stamp and mix colors freely.",
        "Hang the painting to dry and wash hands together."
      ],
      "safety": "Use washable, non-toxic paint, and stay close so paint stays off faces and out of mouths.",
      "keywords": "finger painting hand print stamping paint art creativity sensory",
      "settings": [
        "home"
      ],
      "zh": {
        "title": "手指画与印章",
        "age": "2–3岁",
        "materialsLabel": "4种材料",
        "description": "孩子们把小手和印章按进颜料，再印到纸上，探索颜色和质感。",
        "domains": [
          "感官探索",
          "创造力",
          "精细动作协调"
        ],
        "materials": [
          "可水洗颜料",
          "纸",
          "芹菜根或小白菜根",
          "盘子"
        ],
        "steps": [
          "邀请孩子一起试试用手画画，并说出材料的名称。",
          "示范把手掌平按进颜料，再按到纸上。",
          "一起把芹菜根或小白菜根蘸上颜料，按在纸上，拿起来看看印出的花朵。",
          "让孩子自由地按手印、盖印章、混合颜色。",
          "把画挂起来晾干，再一起洗手。"
        ],
        "safety": "使用可水洗、无毒的颜料；在旁边陪着，别让颜料沾到脸上或放进嘴里。",
        "keywords": "手指画 手印 印章 盖章 颜料 美术 感官"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 640
      }
    }
  },
  {
    "id": "spooning-rice",
    "rootmap": {
      "id": "spooning-rice",
      "title": "Spooning Rice",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Everyday Life",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/spooning-rice.jpg",
      "description": "Children practice fine motor control and concentration by spooning rice from a bowl into two small jars.",
      "domains": [
        "Fine Motor Coordination",
        "Concentration",
        "Independence"
      ],
      "materials": [
        "Bowl of rice",
        "Spoon",
        "2 small jars",
        "Tray"
      ],
      "steps": [
        "Invite your child to try this activity, and name the materials together.",
        "Show how to scoop a spoonful of rice from the bowl.",
        "Pour the rice carefully into the first jar together.",
        "Fill one jar, then the other.",
        "Let your child try, then pour the rice back for more practice."
      ],
      "safety": "Dry rice is small enough to choke on. Stay with your child, and put the rice away when you finish.",
      "keywords": "spooning rice transfer fine motor practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "舀米练习",
        "age": "2–3岁",
        "materialsLabel": "4种材料",
        "description": "孩子们通过用勺子将米从碗中舀到两个小罐子里，练习精细动作控制和专注力。",
        "domains": [
          "精细动作协调",
          "专注力",
          "独立性"
        ],
        "materials": [
          "一碗米",
          "勺子",
          "两个小罐子",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起试试舀米练习，并说出材料的名称。",
          "示范从碗中舀出一勺米。",
          "一起小心地将米倒入第一个罐子。",
          "装好一个罐子，再装另一个。",
          "让孩子尝试，然后将米倒回碗中以便重复练习。"
        ],
        "safety": "生米颗粒小，可能引起窒息。请陪在孩子身边，结束后把米收好。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "pouring-to-cups",
    "rootmap": {
      "id": "pouring-to-cups",
      "title": "Pouring to 3 Cups",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Everyday Life",
      "category": "practical-life",
      "minutes": 12,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/pouring-to-cups.jpg",
      "description": "Children build coordination and concentration by pouring water from a pitcher into three different cups.",
      "domains": [
        "Care of Environment",
        "Coordination",
        "Concentration",
        "Independence"
      ],
      "materials": [
        "Small pitcher of water",
        "3 cups",
        "Tray"
      ],
      "steps": [
        "Invite your child to try pouring, and name the materials together.",
        "Show how to hold the pitcher with both hands.",
        "Demonstrate pouring slowly into the first cup, then the next.",
        "Let your child try pouring into all three cups.",
        "Give your child space to repeat as many times as they like."
      ],
      "safety": "Stay with your child whenever water is out, even a small basin, and wipe up spills so the floor isn't slippery.",
      "keywords": "pouring cups water practical life coordination",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "倒水到三个杯子",
        "age": "2–3岁",
        "materialsLabel": "3种材料",
        "description": "孩子们通过将水从小水壶倒入三个不同的杯子，培养协调能力和专注力。",
        "domains": [
          "照顾环境",
          "协调能力",
          "专注力",
          "独立性"
        ],
        "materials": [
          "装水的小水壶",
          "三个杯子",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起试试倒水练习，并说出材料的名称。",
          "示范如何用双手握住水壶。",
          "展示缓慢地倒入第一个杯子，再倒入下一个。",
          "让孩子尝试倒入这三个杯子。",
          "给孩子空间，让他们按自己的节奏重复练习。"
        ],
        "safety": "只要有水，即使是一小盆，也请始终陪在孩子身边，并及时擦干洒出的水，以免地面湿滑。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "watering-plant",
    "rootmap": {
      "id": "watering-plant",
      "title": "Watering Plant",
      "age": "2–3 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Everyday Life",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "2 materials",
      "image": "../assets/activities/watering-plant.jpg",
      "description": "Children learn to care for their environment by watering a plant, building fine motor control, concentration, and a sense of responsibility.",
      "domains": [
        "Care of Environment",
        "Fine Motor Coordination",
        "Concentration",
        "Independence"
      ],
      "materials": [
        "Small watering can or pitcher",
        "Potted plant"
      ],
      "steps": [
        "Invite your child to try watering the plant, and name the materials together.",
        "Show how to fill the watering can with a small amount of water.",
        "Demonstrate pouring water slowly and carefully around the base of the plant.",
        "Let your child try.",
        "Give your child space to repeat as many times as they like."
      ],
      "safety": "Stay with your child whenever water is out, even a small basin, and wipe up spills so the floor isn't slippery.",
      "keywords": "watering plant care of environment practical life nature",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "浇花",
        "age": "2–3岁",
        "materialsLabel": "2种材料",
        "description": "孩子们通过给植物浇水练习照顾周围环境，培养精细动作控制、专注力和责任感。",
        "domains": [
          "照顾环境",
          "精细动作协调",
          "专注力",
          "独立性"
        ],
        "materials": [
          "小浇水壶或小水壶",
          "盆栽植物"
        ],
        "steps": [
          "邀请孩子一起试试给植物浇水，并说出材料的名称。",
          "示范在浇水壶中装入少量的水。",
          "展示缓慢而小心地在植物根部周围浇水。",
          "让孩子尝试。",
          "给孩子空间，让他们按自己的节奏重复练习。"
        ],
        "safety": "只要有水，即使是一小盆，也请始终陪在孩子身边，并及时擦干洒出的水，以免地面湿滑。"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 3,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 721
      }
    }
  },
  {
    "id": "shelling-edamame",
    "rootmap": {
      "id": "shelling-edamame",
      "title": "Shelling Edamame",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/shelling-edamame.jpg",
      "description": "Children practice food preparation and pincer grip by opening pods and dropping the beans into a bowl.",
      "domains": [
        "Food Preparation",
        "Fine Motor Coordination",
        "Concentration"
      ],
      "materials": [
        "Fresh edamame pods on a plate",
        "Small bowl for the beans",
        "Tray"
      ],
      "steps": [
        "Invite your child to try shelling beans, and name the materials together.",
        "Show how to press along the seam of a pod with your thumbs to open it.",
        "Push the beans out one at a time into the bowl.",
        "Put the empty pod back on the plate, then let your child try.",
        "Give your child space to repeat until all the pods are shelled."
      ],
      "safety": "Raw edamame should be cooked before eating, and young children need the beans cut up, as whole beans are a choking risk.",
      "keywords": "shelling edamame beans pods peas food preparation practical life pincer grip",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "剥毛豆",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们剥开豆荚，把豆子放进碗里，练习食物准备能力和手指捏取。",
        "domains": [
          "食物准备",
          "精细动作协调",
          "专注力"
        ],
        "materials": [
          "盘子里的新鲜毛豆",
          "放豆子的小碗",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起试试剥毛豆，并说出材料的名称。",
          "示范用拇指沿着豆荚的缝按压，把它打开。",
          "把豆子一颗一颗推进碗里。",
          "把空豆荚放回盘子，再让孩子试一试。",
          "给孩子空间，重复练习直到所有毛豆都剥完。"
        ],
        "safety": "生毛豆要煮熟再吃；整颗豆子容易噎住，给小宝宝吃时请切碎。",
        "keywords": "剥毛豆 毛豆 豆子 豆荚 剥豆 食物准备"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 929
      }
    }
  },
  {
    "id": "shelling-corn",
    "rootmap": {
      "id": "shelling-corn",
      "title": "Shelling Corn",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 15,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/shelling-corn.jpg",
      "description": "Children build finger strength and concentration by pulling the husk off an ear of corn and picking the kernels off one by one.",
      "domains": [
        "Food Preparation",
        "Fine Motor Coordination",
        "Hand Strength",
        "Concentration"
      ],
      "materials": [
        "Ear of corn (dried corn is easiest)",
        "Small bowl",
        "Tray"
      ],
      "steps": [
        "Invite your child to explore the corn, and feel the husk and silk together.",
        "Show how to pull the husk down, one leaf at a time.",
        "Demonstrate pushing a kernel off the cob with your thumb and dropping it in the bowl.",
        "Let your child pick the kernels off at their own pace.",
        "Count the kernels or feel them in the bowl together, then tidy the tray."
      ],
      "safety": "Corn kernels are a choking hazard for young children. Stay close, and gather up any loose kernels when finished.",
      "keywords": "shelling corn corn kernels husking corn cob fall harvest autumn food preparation fine motor practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "剥玉米粒",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们剥开玉米皮，再把玉米粒一颗一颗掰下来，锻炼手指力量和专注力。",
        "domains": [
          "食物准备",
          "精细动作协调",
          "手部力量",
          "专注力"
        ],
        "materials": [
          "玉米（干玉米最容易剥）",
          "小碗",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起探索玉米，摸一摸玉米皮和玉米须。",
          "示范把玉米皮一片一片往下剥。",
          "示范用大拇指把一颗玉米粒推下来，放进碗里。",
          "让孩子按自己的节奏剥玉米粒。",
          "一起数一数或摸一摸碗里的玉米粒，再把托盘收拾干净。"
        ],
        "safety": "玉米粒对幼儿有窒息风险。请陪在孩子身边，结束后把散落的玉米粒都收起来。",
        "keywords": "剥玉米粒 剥玉米 玉米 玉米粒 秋天 丰收 食物准备 精细动作 手部力量"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "scrubbing-potatoes",
    "rootmap": {
      "id": "scrubbing-potatoes",
      "title": "Scrubbing Potatoes",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 15,
      "materialsLabel": "6 materials",
      "image": "../assets/activities/scrubbing-potatoes.jpg",
      "description": "Children help prepare a meal and build hand coordination by scrubbing the soil off potatoes with a small brush.",
      "domains": [
        "Food Preparation",
        "Fine Motor Coordination",
        "Concentration",
        "Independence"
      ],
      "materials": [
        "Small potatoes",
        "Bowl of water",
        "Brush",
        "Empty bowl",
        "Towel",
        "Tray"
      ],
      "steps": [
        "Invite your child to help wash the potatoes, and feel the soil on them together.",
        "Show how to hold a potato in the water with one hand and scrub with the brush in the other.",
        "Turn the potato and scrub all sides, then rinse and place it in the clean bowl.",
        "Let your child scrub the rest of the potatoes.",
        "Dry hands with the towel, and change the muddy water together."
      ],
      "safety": "Put a towel under the basin to catch spills, and cook the potatoes before eating.",
      "keywords": "scrubbing potatoes washing potatoes vegetable brush food preparation cooking practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "刷洗土豆",
        "age": "2–6岁",
        "materialsLabel": "6种材料",
        "description": "孩子们用小刷子把土豆上的泥刷干净，帮忙准备饭菜，锻炼双手协调。",
        "domains": [
          "食物准备",
          "精细动作协调",
          "专注力",
          "独立性"
        ],
        "materials": [
          "小土豆",
          "一盆水",
          "刷子",
          "空碗",
          "毛巾",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起洗土豆，先摸一摸土豆上的泥。",
          "示范一只手把土豆按在水里，另一只手用刷子刷。",
          "转动土豆把每一面都刷干净，冲一冲放进干净的碗里。",
          "让孩子刷洗剩下的土豆。",
          "用毛巾擦干手，再一起把脏水换掉。"
        ],
        "safety": "在盆下面垫一条毛巾接住洒出的水。土豆要煮熟后再吃。",
        "keywords": "刷洗土豆 洗土豆 土豆 蔬菜刷 食物准备 做饭"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "mashing-potatoes",
    "rootmap": {
      "id": "mashing-potatoes",
      "title": "Mashing Potatoes",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 15,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/mashing-potatoes.jpg",
      "description": "Children build arm strength and help cook a meal by mashing cooked potatoes with a masher until they are smooth.",
      "domains": [
        "Food Preparation",
        "Hand Strength",
        "Gross Motor Coordination",
        "Independence"
      ],
      "materials": [
        "Cooked, cooled potatoes",
        "Large bowl",
        "Potato masher",
        "Apron"
      ],
      "steps": [
        "Invite your child to help make mashed potatoes, and put on an apron together.",
        "Let your child feel that the cooked potatoes are soft and cool.",
        "Show how to hold the bowl with one hand and press the masher straight down with the other.",
        "Let your child mash until there are no big lumps left.",
        "Add a little butter or milk together, then wash the masher."
      ],
      "safety": "Let the potatoes cool until they are just warm before your child mashes them.",
      "keywords": "mashing potatoes mashed potato masher cooking food preparation arm strength practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "压土豆泥",
        "age": "2–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们用压泥器把煮熟的土豆压成泥，一起做饭，锻炼手臂力量。",
        "domains": [
          "食物准备",
          "手部力量",
          "大肌肉协调",
          "独立性"
        ],
        "materials": [
          "煮熟放凉的土豆",
          "大碗",
          "土豆压泥器",
          "围裙"
        ],
        "steps": [
          "邀请孩子一起做土豆泥，一起穿好围裙。",
          "让孩子摸一摸煮熟的土豆，感受它又软又凉。",
          "示范一只手扶住碗，另一只手把压泥器直直往下压。",
          "让孩子一直压到没有大块为止。",
          "一起加一点黄油或牛奶，再把压泥器洗干净。"
        ],
        "safety": "土豆放凉到微温后再让孩子压。",
        "keywords": "压土豆泥 土豆泥 土豆 压泥器 做饭 食物准备 手臂力量"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [
        "Thanksgiving"
      ],
      "photo": {
        "width": 960,
        "height": 640
      }
    }
  },
  {
    "id": "cracking-eggs",
    "rootmap": {
      "id": "cracking-eggs",
      "title": "Cracking Eggs",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/cracking-eggs.jpg",
      "description": "Children learn a real cooking skill by tapping an egg on the edge of a bowl and opening the shell with both thumbs.",
      "domains": [
        "Food Preparation",
        "Fine Motor Coordination",
        "Concentration"
      ],
      "materials": [
        "Eggs",
        "Mixing bowl",
        "Small bowl for shells",
        "Towel"
      ],
      "steps": [
        "Invite your child to wash their hands, and feel an egg together.",
        "Show how to tap the middle of the egg firmly on the edge of the bowl until it cracks.",
        "Hold the egg over the bowl, press both thumbs into the crack and pull the shell apart.",
        "Let your child crack the next egg, and pick out any bits of shell together.",
        "Put the shells in the small bowl, wipe up drips and wash hands."
      ],
      "safety": "Raw egg can carry germs: wash hands afterwards, don't let your child taste the raw egg, and cook the eggs fully.",
      "keywords": "cracking eggs egg breaking eggs baking cooking food preparation practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "磕鸡蛋",
        "age": "2–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们把鸡蛋在碗边轻轻一磕，再用两个大拇指掰开蛋壳，学会一项真正的厨房技能。",
        "domains": [
          "食物准备",
          "精细动作协调",
          "专注力"
        ],
        "materials": [
          "鸡蛋",
          "搅拌碗",
          "装蛋壳的小碗",
          "毛巾"
        ],
        "steps": [
          "邀请孩子先洗手，一起摸一摸鸡蛋。",
          "示范把鸡蛋中间在碗边用力磕一下，直到出现裂缝。",
          "把鸡蛋拿到碗的上方，两个大拇指按进裂缝，把蛋壳掰开。",
          "让孩子磕下一个鸡蛋，一起把掉进去的蛋壳挑出来。",
          "把蛋壳放进小碗，擦干净滴落的蛋液，再洗手。"
        ],
        "safety": "生鸡蛋可能带有细菌：结束后要洗手，不要让孩子尝生蛋液，鸡蛋要完全煮熟再吃。",
        "keywords": "磕鸡蛋 打鸡蛋 鸡蛋 蛋壳 烘焙 做饭 食物准备"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 1280
      }
    }
  },
  {
    "id": "spreading-toast",
    "rootmap": {
      "id": "spreading-toast",
      "title": "Spreading on Toast",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "4 materials",
      "image": "../assets/activities/spreading-toast.jpg",
      "description": "Children make their own snack and practice wrist control by spreading nut butter or another spread on a slice of bread.",
      "domains": [
        "Food Preparation",
        "Fine Motor Coordination",
        "Independence"
      ],
      "materials": [
        "Slice of bread or toast",
        "Small bowl of spread (nut butter, cream cheese or butter)",
        "Child's spreading knife",
        "Plate"
      ],
      "steps": [
        "Invite your child to wash their hands, and name the materials together.",
        "Show how to scoop a little spread from the bowl with the knife.",
        "Hold the bread steady on the plate with one hand and spread with the other, from the middle out to the edges.",
        "Let your child spread their own slice, adding a little more as needed.",
        "Enjoy the snack together, then wipe the knife and the table."
      ],
      "safety": "Check for nut allergies before using nut butter, and spread it thinly for young children.",
      "keywords": "spreading toast bread peanut butter nut butter cream cheese butter knife snack food preparation practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "抹面包",
        "age": "2–6岁",
        "materialsLabel": "4种材料",
        "description": "孩子们用小抹刀在面包上抹花生酱或其他酱料，自己做点心，练习手腕控制。",
        "domains": [
          "食物准备",
          "精细动作协调",
          "独立性"
        ],
        "materials": [
          "一片面包或吐司",
          "一小碗酱料（花生酱、奶油奶酪或黄油）",
          "儿童抹刀",
          "盘子"
        ],
        "steps": [
          "邀请孩子先洗手，并一起说出材料的名称。",
          "示范用抹刀从碗里舀一点酱。",
          "一只手在盘子里扶住面包，另一只手从中间向边缘抹开。",
          "让孩子自己抹一片，不够时再加一点。",
          "一起享用点心，再把抹刀和桌子擦干净。"
        ],
        "safety": "使用花生酱等坚果酱前，请确认孩子没有坚果过敏；给幼儿要抹得薄一些。",
        "keywords": "抹面包 吐司 花生酱 坚果酱 奶油奶酪 黄油 抹刀 点心 食物准备"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 1280
      }
    }
  },
  {
    "id": "mixing-juice",
    "rootmap": {
      "id": "mixing-juice",
      "title": "Mixing Juice",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Food Preparation",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "5 materials",
      "image": "../assets/activities/mixing-juice.jpg",
      "description": "Children practice pouring and following steps by mixing juice with water in a cup, using a small measuring cup to measure each part.",
      "domains": [
        "Food Preparation",
        "Fine Motor Coordination",
        "Concentration",
        "Independence"
      ],
      "materials": [
        "Pitcher of juice",
        "Pitcher of water",
        "Small measuring cup",
        "Cups",
        "Tray"
      ],
      "steps": [
        "Invite your child to make a drink, and look at the step cards together if you have them.",
        "Show how to pour juice from the pitcher into the measuring cup, then pour it into a cup.",
        "Pour water from the other pitcher into the measuring cup, then add it to the cup.",
        "Let your child mix their own cup, one step at a time.",
        "Enjoy the drink together and wipe up any drips with a cloth."
      ],
      "keywords": "mixing juice diluting juice water pouring pitcher cup drink snack food preparation practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "兑果汁",
        "age": "2–6岁",
        "materialsLabel": "5种材料",
        "description": "孩子们用小量杯分别倒入果汁和水，自己兑一杯果汁，练习倒水和按步骤做事。",
        "domains": [
          "食物准备",
          "精细动作协调",
          "专注力",
          "独立性"
        ],
        "materials": [
          "一壶果汁",
          "一壶水",
          "小量杯",
          "杯子",
          "托盘"
        ],
        "steps": [
          "邀请孩子一起做一杯饮料，如果有步骤卡片，可以先一起看看。",
          "示范把果汁从大壶倒进小量杯，再倒进杯子里。",
          "把水从另一个壶倒进小量杯，再加进杯子里。",
          "让孩子一步一步兑好自己的一杯。",
          "一起喝饮料，用抹布擦干洒出来的水滴。"
        ],
        "keywords": "兑果汁 果汁 兑水 倒水 水壶 杯子 饮料 点心 食物准备"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 720
      }
    }
  },
  {
    "id": "washing-dishes",
    "rootmap": {
      "id": "washing-dishes",
      "title": "Washing Dishes",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Everyday Life",
      "category": "practical-life",
      "minutes": 15,
      "materialsLabel": "6 materials",
      "image": "../assets/activities/washing-dishes.jpg",
      "description": "Children care for their home by washing plates and cups in a tub of soapy water and setting them in the rack to dry.",
      "domains": [
        "Care of Environment",
        "Sequencing",
        "Independence",
        "Concentration"
      ],
      "materials": [
        "Tub of soapy water",
        "Sponge",
        "Plastic plates and cups",
        "Dish rack",
        "Apron",
        "Towel"
      ],
      "steps": [
        "Invite your child to help with the dishes, and put on an apron together.",
        "Show how to dip a plate in the soapy water and wipe both sides with the sponge.",
        "Rinse the plate in clean water and set it in the drying rack.",
        "Let your child wash the rest of the dishes, one at a time.",
        "Empty the tub together and dry hands with the towel."
      ],
      "safety": "Use lukewarm water and unbreakable dishes, keep knives out of the tub, and make sure the step stool is steady.",
      "keywords": "washing dishes dishwashing plates cups sponge soap sink drying rack care of environment practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "洗碗",
        "age": "2–6岁",
        "materialsLabel": "6种材料",
        "description": "孩子们在一盆肥皂水里洗盘子和杯子，再放到碗架上晾干，学习照顾家里的环境。",
        "domains": [
          "照顾环境",
          "顺序感",
          "独立性",
          "专注力"
        ],
        "materials": [
          "一盆肥皂水",
          "海绵",
          "塑料盘子和杯子",
          "碗架",
          "围裙",
          "毛巾"
        ],
        "steps": [
          "邀请孩子一起洗碗，一起穿好围裙。",
          "示范把盘子浸到肥皂水里，用海绵擦洗两面。",
          "用清水冲干净，放到碗架上。",
          "让孩子一件一件洗好剩下的碗盘。",
          "一起把水倒掉，用毛巾擦干手。"
        ],
        "safety": "使用温水和不易碎的碗盘，盆里不要放刀具，并确保脚凳稳固。",
        "keywords": "洗碗 洗盘子 洗杯子 海绵 肥皂水 水池 碗架 家务 照顾环境"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 722
      }
    }
  },
  {
    "id": "matching-socks",
    "rootmap": {
      "id": "matching-socks",
      "title": "Matching Socks",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Everyday Life",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "2 materials",
      "image": "../assets/activities/matching-socks.jpg",
      "description": "Children practice visual matching and help with the laundry by finding each pair of socks and folding them together.",
      "domains": [
        "Visual Discrimination",
        "Fine Motor Coordination",
        "Independence",
        "Concentration"
      ],
      "materials": [
        "Basket of clean socks in pairs",
        "Mat"
      ],
      "steps": [
        "Invite your child to help with the socks, and lay a few on the mat.",
        "Pick up one sock and name its color or pattern together.",
        "Show how to search the basket for the matching sock and lay the two side by side.",
        "Fold the pair together, then let your child find the next pair.",
        "Put the paired socks in the drawer together."
      ],
      "keywords": "matching socks pairing socks sorting colors laundry folding visual discrimination practical life",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "袜子配对",
        "age": "2–6岁",
        "materialsLabel": "2种材料",
        "description": "孩子们为每只袜子找到另一只，配成一双叠好，练习视觉配对，也帮忙做家务。",
        "domains": [
          "视觉辨别",
          "精细动作协调",
          "独立性",
          "专注力"
        ],
        "materials": [
          "一篮成对的干净袜子",
          "工作毯"
        ],
        "steps": [
          "邀请孩子一起整理袜子，先拿几只放在工作毯上。",
          "拿起一只袜子，一起说出它的颜色或花纹。",
          "示范在篮子里找到相同的那只，把两只并排放好。",
          "把这双袜子叠在一起，再让孩子找下一双。",
          "一起把配好的袜子放进抽屉。"
        ],
        "keywords": "袜子配对 配袜子 叠袜子 颜色 配对 家务 视觉辨别"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 640
      }
    }
  },
  {
    "id": "lint-rolling",
    "rootmap": {
      "id": "lint-rolling",
      "title": "Lint Rolling",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Practical Life",
      "topic": "Everyday Life",
      "category": "practical-life",
      "minutes": 10,
      "materialsLabel": "3 materials",
      "image": "../assets/activities/lint-rolling.jpg",
      "description": "Children care for their own clothes by rolling a lint roller over a fuzzy jacket or vest and watching the fluff lift away.",
      "domains": [
        "Care of Self",
        "Hand-Eye Coordination",
        "Concentration"
      ],
      "materials": [
        "Lint roller",
        "A jacket, vest or sweater with some fluff on it",
        "Tray or bin for used sheets"
      ],
      "steps": [
        "Invite your child to help clean a piece of clothing, and lay it flat on the floor or a table together.",
        "Point out the fluff and hair on the fabric, and look at the sticky roller.",
        "Show how to hold the clothing still with one hand and roll slowly from top to bottom with the other.",
        "Let your child roll the whole piece, then look at what the roller picked up.",
        "Peel off the used sheet together, put it in the tray, and hang or fold the clothing."
      ],
      "keywords": "lint roller clothes fluff jacket vest care of clothing self-care tidy",
      "settings": [
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "粘毛滚筒清洁衣服",
        "age": "2–6岁",
        "materialsLabel": "3种材料",
        "description": "孩子们用粘毛滚筒在毛绒外套或背心上来回滚动，看着绒毛被粘走，学会照顾自己的衣服。",
        "domains": [
          "照顾自己",
          "手眼协调",
          "专注力"
        ],
        "materials": [
          "粘毛滚筒",
          "一件有绒毛的外套、背心或毛衣",
          "放用过的胶纸的托盘或小筐"
        ],
        "steps": [
          "邀请孩子一起清洁一件衣服，把它平铺在地上或桌上。",
          "指给孩子看衣服上的绒毛和头发，再一起看看有黏性的滚筒。",
          "示范一只手按住衣服，另一只手从上往下慢慢滚动。",
          "让孩子把整件衣服都滚一遍，再一起看看滚筒粘起了什么。",
          "一起撕下用过的胶纸放进托盘，再把衣服挂好或叠好。"
        ],
        "keywords": "粘毛器 粘毛滚筒 衣服 绒毛 外套 背心 照顾自己"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 1280
      }
    }
  },
  {
    "id": "copy-my-hands",
    "rootmap": {
      "id": "copy-my-hands",
      "title": "Copy My Hands",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Movement",
      "topic": "Sensory Exploration",
      "category": "sensory-movement",
      "minutes": 5,
      "materialsLabel": "No materials",
      "image": "../assets/activities/copy-my-hands.jpg",
      "description": "You make one small, slow hand movement and your child copies it exactly. It's quiet enough for a line or a table, and it asks for careful watching and controlled hands.",
      "domains": [
        "Self-Regulation",
        "Concentration",
        "Fine Motor Coordination"
      ],
      "materials": [],
      "steps": [
        "Hold your hands where your child can see them and say, \"Watch my hands and do the same.\"",
        "Make one slow movement, such as touching your nose, wiggling your fingers or folding your hands.",
        "Wait while your child copies it. Then try two movements in a row.",
        "Make some movements very slow and very small so they have to watch closely.",
        "Let your child lead while you copy them."
      ],
      "keywords": "copy hands movement waiting line quiet game self-control",
      "settings": [
        "waiting",
        "restaurant",
        "grocery",
        "airplane",
        "train",
        "home"
      ],
      "materialType": "none",
      "zh": {
        "title": "学我的手",
        "age": "2–6岁",
        "materialsLabel": "无需材料",
        "description": "你慢慢做一个小小的手部动作，孩子照着做出一模一样的。安静到可以在排队或餐桌边玩，需要孩子仔细看、控制好自己的手。",
        "domains": [
          "自我调节",
          "专注力",
          "精细动作协调"
        ],
        "materials": [],
        "steps": [
          "把手放在孩子看得到的地方，说：“看我的手，跟我做一样的。”",
          "慢慢做一个动作，比如摸摸鼻子、动动手指、双手合起来。",
          "等孩子学完，再试试连续做两个动作。",
          "有些动作做得特别慢、特别小，让孩子要仔细看。",
          "换孩子来做，你来学。"
        ],
        "keywords": "学动作 手 模仿 排队 安静 控制力"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  },
  {
    "id": "family-photo-stories",
    "rootmap": {
      "id": "family-photo-stories",
      "title": "Family Photo Stories",
      "age": "2–6 years",
      "ageKey": "2–3",
      "area": "Language",
      "topic": "Language Development",
      "category": "language",
      "minutes": 10,
      "materialsLabel": "1 material",
      "image": "../assets/activities/family-photo-stories.jpg",
      "description": "Look at a few family photos together and let your child tell the story of each one: who is there and what was happening.",
      "domains": [
        "Vocabulary",
        "Listening",
        "Concentration"
      ],
      "materials": [
        "A few family photos (printed, or on your phone)"
      ],
      "steps": [
        "Choose about five photos beforehand. If you use a phone, turn on airplane or do-not-disturb mode.",
        "Look at one photo together.",
        "Ask, \"Who is this? What were we doing?\"",
        "Let your child tell it, then add one small detail of your own.",
        "After the last photo, put the phone or photos away."
      ],
      "keywords": "family photos stories talking memories travel language",
      "settings": [
        "airplane",
        "train",
        "waiting",
        "restaurant",
        "home"
      ],
      "materialType": "everyday",
      "zh": {
        "title": "讲讲家里的照片",
        "age": "2–6岁",
        "materialsLabel": "1种材料",
        "description": "一起看几张家人的照片，让孩子讲讲每张照片的故事：里面有谁、当时在做什么。",
        "domains": [
          "词汇量",
          "倾听能力",
          "专注力"
        ],
        "materials": [
          "几张家人的照片（打印的或手机里的）"
        ],
        "steps": [
          "提前选五张左右的照片。用手机的话，先打开飞行模式或勿扰模式。",
          "一起看一张照片。",
          "问：“这是谁？我们那时候在做什么？”",
          "让孩子先讲，你再补充一个小细节。",
          "看完最后一张，把手机或照片收起来。"
        ],
        "keywords": "家庭照片 讲故事 聊天 回忆 旅行 语言"
      }
    },
    "littleDays": {
      "minAge": 2,
      "maxAge": 6,
      "place": "indoor",
      "weather": [],
      "seasons": null,
      "holidays": [],
      "photo": {
        "width": 960,
        "height": 886
      }
    }
  }
];

// Celebrations not in Nager.Date, on fixed dates (month-day).
const LOCAL_CELEBRATIONS = [
  { date: "10-31", name: "Halloween" },
  { date: "02-14", name: "Valentine's Day" },
];

if (typeof module !== "undefined") {
  module.exports = { ACTIVITIES, LOCAL_CELEBRATIONS };
}
