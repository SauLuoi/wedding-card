import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Check if admin user already exists, create if not
  const existingAdmin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
      },
    });
    console.log('Admin user created:', admin.username);
  } else {
    console.log('Admin user already exists. Skipping user creation.');
  }

  // 2. Check if wedding config already exists
  const existingConfig = await prisma.weddingConfig.findFirst();
  if (existingConfig) {
    console.log('Existing wedding config found. Skipping config seeding to preserve admin settings.');
    console.log('Database seeded successfully!');
    return;
  }

  console.log('No existing config found. Seeding default data...');

  // 3. Create Default Wedding Config
  const weddingDate = new Date('2026-10-18T10:00:00.000Z'); // October 18, 2026

  const config = await prisma.weddingConfig.create({
    data: {
      slug: 'hoang-minh-thao-vy',
      brideName: 'Nguyễn Thảo Vy',
      brideShortName: 'Thảo Vy',
      groomName: 'Lê Hoàng Minh',
      groomShortName: 'Hoàng Minh',
      weddingDate,
      locationName: 'The Log Restaurant',
      locationAddress: 'Rooftop, GEM Center, 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. Hồ Chí Minh',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.297464878415!2d106.6997457757032!3d10.788484958969408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4a47d2f975%3A0xc0780287e025f1d8!2sThe%20Log%20Restaurant!5e0!3m2!1svi!2s!4v1716347890123!5m2!1svi!2s',
      googleMapsDirectionUrl: 'https://maps.app.goo.gl/wJk8rGfC53a47wX27',
      musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Standard sample mp3
      themeColor: '#d4af37', // Luxurious gold
      fontFamily: 'Playfair Display',
      seoTitle: 'Hoàng Minh & Thảo Vy - Lời Mời Thành Hôn',
      seoDescription: 'Trân trọng kính mời quý khách đến tham dự buổi tiệc cưới ấm cúng của Hoàng Minh và Thảo Vy vào ngày 18 tháng 10 năm 2026.',
      seoImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
      heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920&auto=format&fit=crop',
      aboutTitle: 'Hành Trình Yêu Thương',
      aboutText: 'Gặp nhau vào một ngày thu Hà Nội, khi những cơn gió heo may khẽ khàng lướt qua phố nhỏ. Hai tâm hồn xa lạ tìm thấy sự đồng điệu trong từng câu chuyện, từng bản nhạc tình. Cứ thế, tình yêu nảy nở như một lẽ tự nhiên, dịu dàng và bền bỉ đi qua năm tháng.',
      brideAbout: 'Vy là một cô gái yêu nghệ thuật, nhẹ nhàng nhưng đầy cá tính. Đối với cô, đám cưới là cái kết viên mãn cho hành trình 5 năm gắn bó.',
      groomAbout: 'Minh là chàng trai ấm áp, thực tế, luôn ở bên chở che và là điểm tựa vững chắc cho Vy. Minh tin rằng yêu là cùng nhau đi về một hướng.',
      brideImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop',
      groomImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
      groomQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LE%20HOANG%20MINH',
      groomBankName: 'Vietcombank (VCB)',
      groomAccountNumber: '1012345678',
      groomAccountName: 'LÊ HOÀNG MINH',
      brideQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=NGUYEN%20THAO%20VY',
      brideBankName: 'Techcombank (TCB)',
      brideAccountNumber: '19012345678910',
      brideAccountName: 'NGUYỄN THẢO VY',
    },
  });
  console.log('Wedding Config created for slug:', config.slug);

  // 4. Create Story Timeline
  const stories = [
    {
      dateString: '2020-09-15',
      title: 'Lần đầu gặp gỡ',
      description: 'Chúng mình gặp nhau lần đầu tại một quán cà phê nhỏ. Ánh mắt chạm nhau, thế là câu chuyện bắt đầu.',
      imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop',
      sortOrder: 1,
    },
    {
      dateString: '2021-02-14',
      title: 'Lời tỏ tình ngọt ngào',
      description: 'Dưới ánh đèn lãng mạn của ngày lễ Tình nhân, Minh đã lấy hết can đảm trao gửi lời yêu thương.',
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
      sortOrder: 2,
    },
    {
      dateString: '2025-12-25',
      title: 'Lời cầu hôn bất ngờ',
      description: 'Tại đỉnh Fansipan tuyết rơi nhẹ, Minh quỳ gối trao chiếc nhẫn ước hẹn trước sự chứng kiến của đất trời.',
      imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
      sortOrder: 3,
    },
  ];

  for (const story of stories) {
    await prisma.storyTimeline.create({
      data: {
        ...story,
        weddingConfigId: config.id,
      },
    });
  }
  console.log('Story timeline items created.');

  // 5. Create Gallery Images
  const gallery = [
    { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop', sortOrder: 1 },
    { url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop', sortOrder: 2 },
    { url: 'https://images.unsplash.com/photo-1519225495810-7517cb1df9ee?q=80&w=800&auto=format&fit=crop', sortOrder: 3 },
    { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop', sortOrder: 4 },
    { url: 'https://images.unsplash.com/photo-1529636798458-92182e65f76f?q=80&w=800&auto=format&fit=crop', sortOrder: 5 },
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop', sortOrder: 6 },
  ];

  for (const img of gallery) {
    await prisma.galleryImage.create({
      data: {
        ...img,
        weddingConfigId: config.id,
      },
    });
  }
  console.log('Gallery images created.');

  // 6. Create RSVPs
  const rsvps = [
    { name: 'Nguyễn Văn Nam', phone: '0987654321', guestsCount: 2, wishes: 'Chúc hai bạn trăm năm hạnh phúc, sớm đón quý tử nhé!' },
    { name: 'Trần Thị Thuỷ', phone: '0901234567', guestsCount: 1, wishes: 'Chúc mừng hạnh phúc Vy và Minh. Tiếc quá mình không về kịp ăn cưới.' },
  ];

  for (const rsvp of rsvps) {
    await prisma.rsvp.create({
      data: {
        ...rsvp,
        weddingConfigId: config.id,
      },
    });
  }
  console.log('RSVPs created.');

  // 7. Create Wishes
  const wishes = [
    { name: 'Anh Tuấn (Bạn chú rể)', content: 'Chúc Minh cưới vợ hiền dâu thảo, luôn yêu thương tôn trọng nhau suốt đời nha em.' },
    { name: 'Chị Mai (Đồng nghiệp cô dâu)', content: 'Happy Wedding! Chúc Vy tràn ngập tiếng cười và hạnh phúc bền lâu trong chương mới cuộc đời.' },
    { name: 'Hoàng Lâm', content: 'Cặp trai tài gái sắc đẹp đôi nhất năm! Chúc hai bạn đầu bạc răng long nhé!' },
  ];

  for (const wish of wishes) {
    await prisma.wish.create({
      data: {
        ...wish,
        weddingConfigId: config.id,
        isApproved: true,
      },
    });
  }
  console.log('Wishes created.');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
