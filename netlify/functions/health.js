export default async () => {
  return Response.json({
    ok: true,
    service: 'netlify-demo-backend',
    time: new Date().toISOString()
  });
};
