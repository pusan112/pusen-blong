
import { Post } from './types';

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    title: '在雨天的午后，关于慢生活的思考',
    excerpt: '当窗外的雨滴敲打玻璃，我开始意识到，我们追求的效率是否真的让我们更快乐？',
    content: '今天上海下了一场很大的雨。我坐在窗边，手里端着一杯已经冷掉的拿铁，看着楼下的路人匆忙穿梭。\n\n我们似乎总是在赶路。赶着去上班，赶着去健身，赶着去过所谓“有意义”的生活。但此刻，在雨声中，我发现这种被迫的停歇反而让我感受到了一种久违的宁静。\n\n这种宁静不是因为无事可做，而是因为我终于不再试图掌控接下来的每一分钟。',
    author: '林间',
    date: '2024-06-01',
    category: '生活',
    tags: ['慢生活', '思考', '上海记录', '雨天'],
    coverImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min'
  },
  {
    id: '2',
    title: '为什么我依然钟情于纸质笔记本',
    excerpt: '尽管 iPad 如此强大，但笔尖划过纸张的那种阻尼感是任何数字工具无法取代的。',
    content: '最近又买了一个 Moleskine 的笔记本。很多人问我，作为一名程序员，为什么还坚持用纸笔记录？\n\n其实理由很简单：它不联网。当我在本子上写字时，没有通知弹窗，没有低电量警告。只有我和我的思考。',
    author: '林间',
    date: '2024-05-28',
    category: '感悟',
    tags: ['极简', '工具', '生产力', '写作'],
    coverImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1200',
    readTime: '6 min'
  },
  {
    id: '3',
    title: '数字花园里的杂草：谈谈代码审美',
    excerpt: '好的代码就像一首诗，它不仅仅是解决问题的工具，更是作者思维的体现。',
    content: '最近在重构一个老项目，感触颇深。代码是可以呼吸的。有些代码虽然运行正常，但读起来让人感到局促；而有些代码则逻辑通透，布局优雅。',
    author: '林间',
    date: '2024-05-20',
    category: '技术',
    tags: ['重构', 'Clean Code', '审美', '开发者文化'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    readTime: '10 min'
  }
];

export const CATEGORIES = ['全部', '生活', '感悟', '技术', '摄影', '书单'];
