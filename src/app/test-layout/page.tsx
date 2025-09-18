export default function TestLayoutPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Layout Page</h1>
      <p>This page tests if the Server Component error is resolved.</p>
      <div className="mt-4 p-4 bg-green-100 rounded">
        <p className="text-green-800">If you can see this page without errors, the Server Component issue is fixed!</p>
      </div>
    </div>
  );
}
