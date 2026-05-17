const amqp = require('amqplib');

let connection, channel;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://rabbitmq:5672');
    channel = await connection.createChannel();

    const queue = 'task_created';

    await channel.assertQueue(queue);

    console.log('✅ Notification Service Connected to RabbitMQ');

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        console.log('📩 New Task Event Received:');
        console.log(data);

        // 👉 Simulate notification (email, SMS, etc.)
        console.log(`🔔 Notify user ${data.userId} about task: ${data.title}`);

        channel.ack(msg);
      }
    });

  } catch (error) {
    console.error('❌ Error connecting to RabbitMQ', error);
    setTimeout(connectRabbitMQ, 5000); // retry
  }
}

connectRabbitMQ();