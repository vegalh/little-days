// Exploration guides (PRD.md 7.14). Written by hand for Little Days. Edited 2026-11-04 for
// child-led wording (ideas, not tasks); still to be reviewed by the owner before the pilot. Each guide is about a kind of place, never a specific one, so nothing
// here may say what a particular place has, offers or allows.
// Each guide has three perspectives, one per visit. activities are RootMap IDs offered
// as at-home ideas afterwards.
// No page code here, so tests can run it in Node.

const GUIDES = {
  park: {
    why: "Parks change with every season and every visit, and there's room to move and look closely.",
    activities: ["bark-rubbing", "leaf-rubbing", "egg-carton-nature-hunt"],
    sets: [
      {
        focus: "Leaves and trees",
        notice: ["Leaves of different shapes, sizes and colors", "Rough and smooth bark", "Tall trees and small plants side by side"],
        before: ["Bring a small bag or egg carton for treasures that are already on the ground."],
        during: ["Pick up two leaves and ask, “How are they different?”", "Touch the bark together and find words for how it feels.", "Follow your child's lead on where to stop and look."],
        after: ["Lay out what you found and sort it by color or size."],
        practical: "Let your child carry and look after their own collection bag.",
      },
      {
        focus: "Sounds and birds",
        notice: ["Birdsong, wind and footsteps", "Birds on the ground and in the trees", "Quiet places and busy places"],
        before: ["Talk about being still and listening for a moment."],
        during: ["Close your eyes together and count the sounds you hear.", "Watch a bird and copy how it moves.", "Name sounds as near or far."],
        after: ["Make the sounds you remember and guess each other's."],
        practical: "Let your child choose a spot to sit, and carry the blanket or mat.",
      },
      {
        focus: "Seasonal changes",
        notice: ["What's growing, falling or blooming now", "Puddles, dry ground, frost or mud", "What people are wearing and doing"],
        before: ["Ask, “What do you think will be different since last time?”"],
        during: ["Return to one tree and look at it from top to bottom.", "Feel the air, the ground and the light.", "Notice how the park looks compared with the last visit."],
        after: ["Draw the same tree and compare it with a drawing from another season."],
        practical: "Let your child help choose and put on clothes for the weather.",
      },
    ],
  },
  playground: {
    why: "Playgrounds invite climbing, balancing and taking turns, all in the child's own way.",
    activities: ["statue-game", "duck-walk", "copy-my-hands"],
    sets: [
      {
        focus: "Moving my body",
        notice: ["High and low places", "Things that spin, slide or swing", "How bodies feel after running"],
        before: ["Check the equipment yourself first, and agree on where you'll be."],
        during: ["Let your child choose what to try, at their own pace.", "Describe what they do: “You climbed up high!”", "Count steps, rungs or swings together."],
        after: ["Talk about what felt easy and what felt hard."],
        practical: "Let your child carry their own water bottle and put on their own shoes.",
      },
      {
        focus: "Sharing and turns",
        notice: ["Other children playing", "Waiting for a turn", "Friendly faces and words"],
        before: ["For older children, practice a simple phrase, like “Can I have a turn when you're done?”"],
        during: ["Watch together how other children take turns.", "Name feelings you see: excited, waiting, proud.", "Step back so your child can try first."],
        after: ["Remember together someone your child played near or with."],
        practical: "Let your child decide when it's time to move to the next thing.",
      },
      {
        focus: "Shapes and materials",
        notice: ["Circles, triangles and straight lines", "Metal, wood, plastic, sand or bark", "Warm and cool surfaces"],
        before: ["Bring a small cloth to dry a wet seat if needed."],
        during: ["Notice shapes in the equipment, if your child is interested.", "Touch different surfaces and find words for them.", "Notice shadows and where the sun is."],
        after: ["Build a small playground from blocks or boxes at home."],
        practical: "Let your child brush off sand and tidy their shoes before leaving.",
      },
    ],
  },
  garden: {
    why: "Gardens are full of colors, scents and small living things to look at closely.",
    activities: ["watering-plant", "nature-prints-in-dough", "leaf-rubbing"],
    sets: [
      {
        focus: "Colors and shapes",
        notice: ["Flowers and leaves of many colors", "Round, pointed and feathery shapes", "Big plants and tiny ones"],
        before: ["Talk about looking with eyes and gentle hands, and leaving flowers where they grow."],
        during: ["Crouch down to see plants at your child's height.", "Wonder together where else a favorite color appears.", "Name what you see with simple, exact words."],
        after: ["Paint or draw a favorite flower from memory."],
        practical: "Let your child water a plant at home.",
      },
      {
        focus: "Smells and textures",
        notice: ["Sweet, fresh or earthy smells", "Soft, fuzzy or waxy leaves", "Damp soil after rain"],
        before: ["Check posted rules about touching plants. Some plants prickle or sting, so look first together."],
        during: ["Smell a flower together and find a word for it.", "Where touching is allowed, gently feel a leaf.", "Notice how the air smells in different spots."],
        after: ["Smell herbs or fruit at home and compare."],
        practical: "Let your child wash their own hands after the visit.",
      },
      {
        focus: "Small creatures",
        notice: ["Bees, butterflies, ants or worms", "Holes, webs and nibbled leaves", "Where creatures hide"],
        before: ["Talk about watching creatures without touching them."],
        during: ["Stay still and watch one small creature move.", "Count legs or wings together.", "Wonder aloud where it might be going."],
        after: ["Act out how the creature moved."],
        practical: "Let your child carry a small magnifying glass, if you have one.",
      },
    ],
  },
  library: {
    why: "Libraries are quiet, shared spaces full of stories, pictures and helpful people.",
    activities: ["family-photo-stories", "i-spy-a-color", "drawing-the-other-half"],
    sets: [
      {
        focus: "Books and pictures",
        notice: ["Shelves, covers and colors", "Big books and small books", "Pictures of animals, places and people"],
        before: ["Talk about using quiet voices and walking feet indoors."],
        during: ["Let your child choose a book by its cover.", "Look at one picture together and talk about what's happening.", "If your child is curious, look for a letter from their name."],
        after: ["Tell the story again at home in your child's own words."],
        practical: "Let your child carry the books and help put them in the bag.",
      },
      {
        focus: "People who help",
        notice: ["People reading, working and helping", "Signs and labels", "How people ask for help"],
        before: ["Think together of one question your child might ask."],
        during: ["Watch how people find and borrow things.", "Notice the signs and guess what they say.", "If your child wants, let them say hello or thank you."],
        after: ["Play library at home, with books to lend."],
        practical: "Let your child help keep track of the books you brought.",
      },
      {
        focus: "Quiet and calm",
        notice: ["How the room sounds", "Soft and hard seats", "Light from windows and lamps"],
        before: ["Bring a favorite book from home to share."],
        during: ["Sit together and listen to the quiet for a moment.", "Let your child choose a cozy spot.", "Read a short book slowly, at your child's pace."],
        after: ["Make a calm reading corner at home."],
        practical: "Let your child choose where to put their books when you get home.",
      },
    ],
  },
  bakery: {
    why: "Bakeries are full of shapes, smells and people at work.",
    activities: ["spreading-toast", "cracking-eggs", "nature-prints-in-dough"],
    sets: [
      {
        focus: "Shapes and colors",
        notice: ["Round, long, twisted and braided shapes", "Golden, brown and pale colors", "Big loaves and small rolls"],
        before: ["Talk about looking with eyes, and asking before touching anything."],
        during: ["Look for round, long and twisted shapes, if your child is interested.", "Name the colors your child points to.", "Compare a big one and a small one."],
        after: ["Make bread shapes with playdough at home."],
        practical: "Let your child hand over the money or hold the bag, if you buy something.",
      },
      {
        focus: "Smells and ingredients",
        notice: ["Warm, sweet or yeasty smells", "Seeds, crusts and crumbs", "Flour dust"],
        before: ["Talk about what bread is made from."],
        during: ["Take a slow breath together and describe the smell.", "Look for seeds or toppings.", "Guess what might be inside something."],
        after: ["Look at flour, water and seeds at home and feel each one."],
        practical: "Let your child help measure flour or spread butter at home.",
      },
      {
        focus: "People and their jobs",
        notice: ["People baking, serving or cleaning", "Aprons, trays and tools", "How people wait and pay"],
        before: ["Talk about jobs people do so others can eat."],
        during: ["Watch what each person is doing.", "Notice the tools and what they might be for.", "If your child wants, let them say please and thank you."],
        after: ["Play bakery at home, taking turns as baker and customer."],
        practical: "Let your child wipe the table or set out plates at home.",
      },
    ],
  },
  grocery: {
    why: "Food shops show where everyday food comes from, with colors, numbers and people everywhere.",
    activities: ["exploring-fall-vegetables", "scrubbing-potatoes", "shelling-edamame"],
    sets: [
      {
        focus: "Colors and shapes",
        notice: ["Fruit and vegetables of every color", "Round, long and bumpy shapes", "Big piles and small baskets"],
        before: ["Make a short list together, maybe with pictures."],
        during: ["Notice the colors together, and let your child name the ones they see.", "If you're buying fruit, let your child hold two and feel which is heavier.", "Let your child choose one item from the list."],
        after: ["Sort what you bought by color or shape."],
        practical: "Let your child put items in the basket and unpack them at home.",
      },
      {
        focus: "Where food comes from",
        notice: ["Food that grows on trees, in the ground or on vines", "Food in boxes, bags and tins", "Cold and warm aisles"],
        before: ["Talk about one food and where it grows."],
        during: ["Wonder together which foods grew in the ground.", "Notice which foods are kept cold.", "Wonder aloud how the food got to the shop."],
        after: ["Wash or peel a vegetable you bought."],
        practical: "Let your child scrub potatoes or wash fruit at home.",
      },
      {
        focus: "People and their jobs",
        notice: ["People stocking shelves, weighing and helping", "Carts, scales and checkout counters", "How people wait in line"],
        before: ["Talk about the people who help in a shop."],
        during: ["Watch what different people are doing.", "Notice numbers on signs and scales.", "If your child wants, let them hand something to the cashier."],
        after: ["Play shop at home with real fruit or boxes."],
        practical: "Let your child carry a small bag home.",
      },
    ],
  },
  "post-office": {
    why: "Post offices show how letters and parcels travel between people.",
    activities: ["family-photo-stories", "paper-collage", "dotting"],
    sets: [
      {
        focus: "Letters and parcels",
        notice: ["Envelopes, boxes and stamps", "Big and small parcels", "Writing and numbers on labels"],
        before: ["Make a simple card or drawing together to send to someone."],
        during: ["Look at the shapes and sizes of parcels.", "Notice numbers on signs or labels.", "Let your child hold the letter until it's time to post it."],
        after: ["Talk about who will open the letter and how they'll feel."],
        practical: "Let your child put the stamp on and drop the letter in the box.",
      },
      {
        focus: "People who help",
        notice: ["People working at the counter", "Carts, scales and sorting", "How people wait their turn"],
        before: ["Talk about what a post worker does."],
        during: ["Watch how parcels are weighed or handed over.", "Notice how people wait in line.", "If your child wants, let them say thank you."],
        after: ["Play post office at home with envelopes and a box."],
        practical: "Let your child sort mail at home into piles.",
      },
      {
        focus: "Journeys",
        notice: ["Mailboxes on the way", "Vans or carts that carry mail", "Addresses on houses"],
        before: ["Look at your own address and its number."],
        during: ["Notice mailboxes on the walk.", "Say house numbers together, if your child enjoys it.", "Wonder where a parcel might be going."],
        after: ["Draw a map of the walk from home to the post office."],
        practical: "Let your child bring in the mail at home.",
      },
    ],
  },
  "fire-station": {
    why: "Fire stations are part of how a community looks after itself. Seen from the sidewalk, there's plenty to notice.",
    activities: ["i-spy-a-color", "whats-that-sound", "copy-my-hands"],
    sets: [
      {
        focus: "Big shapes and colors",
        notice: ["Big doors and what's behind them, if they're open", "Red and other bright colors", "Signs and numbers on the building"],
        before: ["Plan to look from the sidewalk, and keep clear of the driveway."],
        during: ["Stand well back from the doors and the driveway, and look together.", "Name the colors and shapes your child notices.", "Count windows or doors, if your child enjoys counting."],
        after: ["Draw the building from memory."],
        practical: "Let your child help pack a small snack and water for the walk.",
      },
      {
        focus: "Sounds",
        notice: ["Sirens in the distance", "Engines and doors", "Quiet moments"],
        before: ["Talk about what a siren means: someone needs help, so we move out of the way."],
        during: ["Stand still and listen.", "If you hear a siren, talk about what it means.", "Notice how sounds change as you walk away."],
        after: ["Play a listening game: loud and quiet sounds."],
        practical: "Let your child practice stopping and waiting at the curb.",
      },
      {
        focus: "People who help",
        notice: ["Uniforms, helmets and boots, if anyone is outside", "People working together", "Signs on the building"],
        before: ["Talk about the many people who help in your community."],
        during: ["Watch from the sidewalk without going in.", "Notice any signs and talk about what they might say.", "If someone is outside and the moment suits, your child can wave."],
        after: ["Talk about helpers your child knows."],
        practical: "Let your child practice putting on their own coat and boots.",
      },
    ],
  },
  museum: {
    why: "Museums and galleries hold things to look at slowly, talk about and wonder over.",
    activities: ["paper-collage", "dotting", "drawing-the-other-half"],
    sets: [
      {
        focus: "Looking closely",
        notice: ["Colors, lines and shapes", "Big and tiny things", "Things that are old or new"],
        before: ["Talk about looking with eyes, not hands, unless a sign says touching is fine."],
        during: ["Choose one thing and look at it for a long moment.", "Ask, “What do you see?” and listen.", "Let your child choose where to go next."],
        after: ["Draw the thing your child liked best."],
        practical: "Let your child carry a small notebook and crayon.",
      },
      {
        focus: "Stories",
        notice: ["People, animals and places in pictures", "Faces and feelings", "Things that seem to be moving"],
        before: ["Keep the visit short: a few things are plenty."],
        during: ["Make up a story about a picture together.", "Copy a pose or a face you see.", "Wonder aloud what happened next."],
        after: ["Tell the story again at home."],
        practical: "Let your child decide when you've seen enough.",
      },
      {
        focus: "Materials",
        notice: ["Paint, stone, wood, metal or cloth", "Smooth and rough surfaces", "Light and shadow"],
        before: ["Bring a few materials from home to compare later."],
        during: ["Wonder together what something is made of.", "Notice shiny and dull surfaces.", "Notice how light falls on things."],
        after: ["Make a collage from paper and fabric scraps."],
        practical: "Let your child help tidy the art materials afterwards.",
      },
    ],
  },
};

// Shown above every guide.
const GUIDE_NOTE = "Ideas, not tasks: follow what your child notices, and stop when they've had enough.";

// Category fallbacks for every other type.
const CATEGORY_GUIDES = {
  "nature": "park",
  "everyday-life": {
    why: "Everyday places show children how their community works.",
    activities: ["matching-socks", "washing-dishes", "mixing-juice"],
    sets: [
      {
        focus: "What's here",
        notice: ["Colors, shapes and signs", "Things for sale or in use", "Sounds and smells"],
        before: ["Talk about where you're going and what it's for."],
        during: ["Let your child point out what they recognize, and name it together.", "Notice what's new to your child.", "Follow your child's questions."],
        after: ["Talk about one thing you saw."],
        practical: "Let your child carry something small for you.",
      },
      {
        focus: "People and jobs",
        notice: ["People working", "Tools and machines", "How people help each other"],
        before: ["Talk about the jobs people do."],
        during: ["Watch what one person is doing.", "Guess what a tool is for.", "If your child wants, let them say thank you."],
        after: ["Play pretend: your child does the job."],
        practical: "Let your child help with a similar job at home.",
      },
      {
        focus: "Numbers and words",
        notice: ["Numbers on doors and signs", "Letters your child knows", "Lines and lists"],
        before: ["Look at a number or letter your child knows."],
        during: ["Notice if that number or letter appears.", "Count things your child is interested in.", "Read a sign together."],
        after: ["Write or draw a sign for home."],
        practical: "Let your child help make a list for the next trip.",
      },
    ],
  },
  "community-helpers": {
    why: "These places are part of how a community looks after people. From outside there's plenty to notice.",
    activities: ["family-photo-stories", "i-spy-a-color", "copy-my-hands"],
    sets: [
      {
        focus: "The building",
        notice: ["Doors, windows and signs", "Flags, colors and numbers", "Vehicles parked nearby"],
        before: ["Plan to look from outside, and keep clear of doors and driveways."],
        during: ["Name the shapes and colors your child notices.", "Count windows or doors, if your child enjoys counting.", "Talk about what happens inside."],
        after: ["Draw the building from memory."],
        practical: "Let your child help pack for the walk.",
      },
      {
        focus: "People who help",
        notice: ["Uniforms and badges", "People coming and going", "How people help each other"],
        before: ["Talk about helpers your child knows."],
        during: ["Watch from a respectful distance.", "Talk about what each helper does.", "If someone is outside and the moment suits, your child can wave."],
        after: ["Play pretend helpers at home."],
        practical: "Let your child practice waiting calmly.",
      },
      {
        focus: "On the way",
        notice: ["Signs, crossings and lights", "Mailboxes and benches", "Other helpers on the street"],
        before: ["Look at the route together first."],
        during: ["Stop at each crossing and look together.", "Notice signs and talk about them.", "Notice helpers you see on the way."],
        after: ["Draw a map of the walk."],
        practical: "Let your child press the crossing button, with you.",
      },
    ],
  },
  "art-culture": "museum",
  "animals-wildlife": {
    why: "Animals invite children to watch quietly, wonder and care.",
    activities: ["duck-walk", "whats-that-sound", "egg-carton-nature-hunt"],
    sets: [
      {
        focus: "How animals move",
        notice: ["Walking, flying, swimming or hopping", "Fast and slow animals", "Big and small animals"],
        before: ["Talk about watching quietly, and only touching where it's clearly allowed."],
        during: ["Watch one animal for a while.", "Copy how it moves.", "Use words like fast, slow, high and low."],
        after: ["Play an animal-moves game at home."],
        practical: "Let your child help care for a pet or a plant at home.",
      },
      {
        focus: "Sounds and homes",
        notice: ["Calls, chirps and barks", "Nests, burrows and shelters", "Where animals rest"],
        before: ["Talk about animal homes."],
        during: ["Stand still and listen.", "Look for where an animal might sleep.", "Wonder aloud what it eats."],
        after: ["Build an animal home from boxes or blankets."],
        practical: "Let your child set up a cozy spot for a toy animal.",
      },
      {
        focus: "Caring",
        notice: ["How people care for animals", "Water, food and shelter", "Signs about animals"],
        before: ["Talk about being gentle."],
        during: ["Notice what animals need.", "Watch how people look after them.", "Talk about how the animal might feel."],
        after: ["Care for a plant or toy together."],
        practical: "Let your child fill a water bowl or water a plant.",
      },
    ],
  },
  "movement": "playground",
};

// Which guide a Google place type uses.
const GUIDE_FOR_TYPE = {
  park: "park",
  playground: "playground",
  garden: "garden",
  botanical_garden: "garden",
  library: "library",
  bakery: "bakery",
  grocery_store: "grocery",
  supermarket: "grocery",
  market: "grocery",
  farmers_market: "grocery",
  post_office: "post-office",
  fire_station: "fire-station",
  museum: "museum",
  art_gallery: "museum",
};

// type: the place's Google type (or null); category: the Little Days category key.
function guideFor(type, category) {
  if (GUIDE_FOR_TYPE[type]) return GUIDES[GUIDE_FOR_TYPE[type]];
  const fallback = CATEGORY_GUIDES[category];
  return typeof fallback === "string" ? GUIDES[fallback] : fallback;
}

// Classroom wording (PRD.md 7.13): "your child" becomes "the children", with the verbs that
// follow changed to match. Only the verbs the guides really use are listed.
function forGroup(text) {
  return text
    .replace(/\b([Yy])our child's\b/g, (_, y) => `${y === "Y" ? "The" : "the"} children's`)
    .replace(/\b([Yy])our child (is|does|wants|knows|notices|enjoys|points|practices)\b/g, (_, y, verb) =>
      `${y === "Y" ? "The" : "the"} children ${{ is: "are", does: "do", wants: "want", knows: "know", notices: "notice", enjoys: "enjoy", points: "point", practices: "practice" }[verb]}`)
    .replace(/\b([Yy])our child\b/g, (_, y) => `${y === "Y" ? "The" : "the"} children`);
}

// From Phase 4: the perspective for a place's next visit (PRD.md 7.14).
function perspectiveFor(guide, visits) {
  return visits % guide.sets.length;
}

if (typeof module !== "undefined") {
  module.exports = { GUIDES, CATEGORY_GUIDES, GUIDE_FOR_TYPE, GUIDE_NOTE, guideFor, perspectiveFor, forGroup };
}
