import { identifyItem } from '../server/utils/localIdentify.js';

// a publicly accessible test image — a clothing item on white background
const TEST_IMAGE_URL = 
'https://scontent.fsan1-1.fna.fbcdn.net/v/t39.84726-6/714730230_1006775295277216_6266855003966791635_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=109&ccb=1-7&_nc_sid=92e707&_nc_ohc=EtjcGxW9RGcQ7kNvwHV1jTG&_nc_oc=AdqBgYW3ibyFXQRAx3Z6thhCGYK9c04QDKQSr1eeYQ5QfAD7AAbqALYH-ed-SAeyB-WT9cnMIGuhWDFSQtJP-dKv&_nc_zt=14&_nc_ht=scontent.fsan1-1.fna&_nc_gid=6Td-slAlxT_UfzTbSK9Q2w&_nc_ss=7b2a8&oh=00_Af9WoX26AN0CYi8YqnCxXqpzFxWw6NbKV7jOqkBiherbdw&oe=6A38CE75';

async function runTest() {
  console.log('Testing identifyItem with image:', TEST_IMAGE_URL);
  console.log('─'.repeat(50));

  try {
    console.time('identification');
    const result = await identifyItem(TEST_IMAGE_URL);
    console.timeEnd('identification');

    console.log('\n✓ Parsed successfully\n');
    console.log('Result:', JSON.stringify(result, null, 2));

    // basic shape validation
    const expected = ['title', 'brand', 'category', 'color', 'material', 'condition', 'estimatedPrice', 'tags', 'description'];
    const missing = expected.filter(key => !(key in result));
    const extra = Object.keys(result).filter(key => !expected.includes(key));

    if (missing.length) console.warn('⚠ Missing fields:', missing);
    if (extra.length) console.warn('⚠ Unexpected fields:', extra);
    if (!missing.length && !extra.length) console.log('✓ All expected fields present');

    if (!Array.isArray(result.tags)) console.warn('⚠ tags should be an array');
    else console.log('✓ tags is an array:', result.tags);

    if (result.estimatedPrice !== null && typeof result.estimatedPrice !== 'number') {
      console.warn('⚠ estimatedPrice should be a number or null, got:', typeof result.estimatedPrice);
    } else {
      console.log('✓ estimatedPrice type ok:', result.estimatedPrice);
    }

    const validCategories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];
    if (result.category && !validCategories.includes(result.category)) {
      console.warn('⚠ unexpected category:', result.category);
    } else {
      console.log('✓ category ok:', result.category);
    }

    const validConditions = ['new_with_tags', 'like_new', 'good', 'fair', 'poor'];
    if (result.condition && !validConditions.includes(result.condition)) {
      console.warn('⚠ unexpected condition:', result.condition);
    } else {
      console.log('✓ condition ok:', result.condition);
    }

  } catch (err) {
    console.error('\n✗ Test failed:', err.message);
    if (err instanceof SyntaxError) {
      console.error('  → JSON parse error — model returned non-JSON output');
    }
    process.exit(1);
  }
}

runTest();