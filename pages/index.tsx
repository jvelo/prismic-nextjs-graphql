import withApollo from "../src/with-apollo";
import {PageQuery, usePageQuery} from "../queries/page.graphql";
import {RichText} from 'prismic-reactjs';
import {linkResolver} from "../src/links";
import htmlSerializer from "../src/prismic";

// type Props = {
//     query: PageQuery;
// }

function HomePage() {
    const {data, error} = usePageQuery({
        variables: {slug: "home"}
    });

    if (!data) {
        return <div>Oh no :( 👎
            <code>{process.env.PRISMIC_REPOSITORY}</code>
        </div>
    }

    return data && <div>Welcome to Next.js!

        <RichText render={data.page.title}
                  linkResolver={linkResolver}
                  htmlSerializer={htmlSerializer}
        />

        <RichText render={data.page.content}
                  linkResolver={linkResolver}
                  htmlSerializer={htmlSerializer}
        />

        <br/>

        The prismic repository associated with this project is: <code>{process.env.PRISMIC_REPOSITORY}</code>
    </div>
}

export default withApollo(HomePage);
