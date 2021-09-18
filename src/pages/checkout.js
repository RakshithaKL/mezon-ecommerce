import Image from "next/image";
import Header from "../components/Header";
import CheckoutProducts from "../components/CheckoutProducts";
import Currency from "react-currency-formatter";
import axios from "axios";
import { selectItems, selectTotal } from "../slices/basketSlice";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/client";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.stripe_public_key);

function Checkout() {
  const items = useSelector(selectItems);
  const total = useSelector(selectTotal);
  const [session] = useSession();

  const createCheckoutSession = async () => {
    const stripe = await stripePromise;

    // Call the backend to create a checkout session...
    const checkoutSession = await axios.post("/api/create-checkout-session", {
      items: items,
      email: session.user.email,
    });

    // Redirect user/customer to Stripe checkout
    const result = await stripe.redirectToCheckout({
      // key : value
      sessionId: checkoutSession.data.id,
    });

    // without braces bcoz it is one liner
    if (result.error) alert(result.error.message);
  };

  return (
    <div className="bg-gray-100">
      <Header />
      <main className="lg:flex max-w-screen-2xl mx-auto ">
        {/* left */}
        <div className="flex-grow m-5 shadow-sm">
          <Image
            src="https://links.papareact.com/ikj"
            width={1020}
            height={250}
            objectFit="contain"
          />
          <div className="flex flex-col p-5 space-y-10 bg-white">
            {/*  border-b -> border-bottom , pb-> padding bottom */}
            <h1 className="text-3xl border-b pb-4">
              {items.length === 0
                ? "Your Amazon basket is empty."
                : "Your Shopping Basket"}
            </h1>

            {/* i= index */}
            {/*  when mapping through array in react always used unique key, if you don't have unique key used index */}
            {/*  best case : unique key
                worst case : index

             */}

            {items.map((item, i) => (
              <CheckoutProducts
                key={i}
                id={item.id}
                title={item.title}
                price={item.price}
                description={item.description}
                category={item.category}
                image={item.image}
                rating={item.rating}
                hasPrime={item.hasPrime}
              />
            ))}
          </div>
        </div>
        {/* Right */}
        <div className="flex flex-col bg-white p-10 shadow-md ">
          {items.length > 0 && (
            <>
              <h2 className="whitespace-nowrap">
                Subtotal ({items.length} items) :{" "}
                <span className="font-bold">
                  <Currency quantity={total} currency="INR" />
                </span>
              </h2>
              <button
                role="link"
                onClick={createCheckoutSession}
               disabled={!session}
                className={`button mt-2  ${
                  !session &&
                  "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
              >
                {!session ? "Sign in to proceed " : "proceed to checkout"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Checkout;
