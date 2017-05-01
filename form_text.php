Array
(
    [#node_edit_form] => 1
    [#attributes] => Array
        (
            [class] => Array
                (
                    [0] => node-form
                    [1] => node-star_trek_movies-form
                )

        )

    [nid] => Array
        (
            [#type] => value
            [#value] =>
        )

    [vid] => Array
        (
            [#type] => value
            [#value] =>
        )

    [uid] => Array
        (
            [#type] => value
            [#value] => 1
        )

    [created] => Array
        (
            [#type] => value
            [#value] => 1493680701
        )

    [type] => Array
        (
            [#type] => value
            [#value] => star_trek_movies
        )

    [language] => Array
        (
            [#type] => value
            [#value] => und
        )

    [changed] => Array
        (
            [#type] => hidden
            [#default_value] =>
        )

    [title] => Array
        (
            [#type] => textfield
            [#title] => Title
            [#required] => 1
            [#default_value] =>
            [#maxlength] => 255
            [#weight] => -5
        )

    [#node] => stdClass Object
        (
            [uid] => 1
            [name] => admin
            [type] => star_trek_movies
            [language] => und
            [title] =>
            [status] => 1
            [promote] => 1
            [sticky] => 0
            [created] => 1493680701
            [revision] =>
            [comment] => 2
            [menu] => Array
                (
                    [link_title] =>
                    [mlid] => 0
                    [plid] => 0
                    [menu_name] => main-menu
                    [weight] => 0
                    [options] => Array
                        (
                        )

                    [module] => menu
                    [expanded] => 0
                    [hidden] => 0
                    [has_children] => 0
                    [customized] => 0
                    [parent_depth_limit] => 8
                )

        )

    [additional_settings] => Array
        (
            [#type] => vertical_tabs
            [#weight] => 99
        )

    [revision_information] => Array
        (
            [#type] => fieldset
            [#title] => Revision information
            [#collapsible] => 1
            [#collapsed] => 1
            [#group] => additional_settings
            [#attributes] => Array
                (
                    [class] => Array
                        (
                            [0] => node-form-revision-information
                        )

                )

            [#attached] => Array
                (
                    [js] => Array
                        (
                            [0] => modules/node/node.js
                        )

                )

            [#weight] => 20
            [#access] => 1
            [revision] => Array
                (
                    [#type] => checkbox
                    [#title] => Create new revision
                    [#default_value] =>
                    [#access] => 1
                    [#states] => Array
                        (
                            [checked] => Array
                                (
                                    [textarea[name="log"]] => Array
                                        (
                                            [empty] =>
                                        )

                                )

                        )

                )

            [log] => Array
                (
                    [#type] => textarea
                    [#title] => Revision log message
                    [#rows] => 4
                    [#default_value] =>
                    [#description] => Provide an explanation of the changes you are making. This will help other authors understand your motivations.
                )

        )

    [author] => Array
        (
            [#type] => fieldset
            [#access] => 1
            [#title] => Authoring information
            [#collapsible] => 1
            [#collapsed] => 1
            [#group] => additional_settings
            [#attributes] => Array
                (
                    [class] => Array
                        (
                            [0] => node-form-author
                        )

                )

            [#attached] => Array
                (
                    [js] => Array
                        (
                            [0] => modules/node/node.js
                            [1] => Array
                                (
                                    [type] => setting
                                    [data] => Array
                                        (
                                            [anonymous] => Anonymous
                                        )

                                )

                        )

                )

            [#weight] => 90
            [name] => Array
                (
                    [#type] => textfield
                    [#title] => Authored by
                    [#maxlength] => 60
                    [#autocomplete_path] => user/autocomplete
                    [#default_value] => admin
                    [#weight] => -1
                    [#description] => Leave blank for Anonymous.
                )

            [date] => Array
                (
                    [#type] => textfield
                    [#title] => Authored on
                    [#maxlength] => 25
                    [#description] => Format: 2017-05-01 16:18:21 -0700. The date format is YYYY-MM-DD and -0700 is the time zone offset from UTC. Leave blank to use the time of form submission.
                    [#default_value] =>
                )

        )

    [options] => Array
        (
            [#type] => fieldset
            [#access] => 1
            [#title] => Publishing options
            [#collapsible] => 1
            [#collapsed] => 1
            [#group] => additional_settings
            [#attributes] => Array
                (
                    [class] => Array
                        (
                            [0] => node-form-options
                        )

                )

            [#attached] => Array
                (
                    [js] => Array
                        (
                            [0] => modules/node/node.js
                        )

                )

            [#weight] => 95
            [status] => Array
                (
                    [#type] => checkbox
                    [#title] => Published
                    [#default_value] => 1
                )

            [promote] => Array
                (
                    [#type] => checkbox
                    [#title] => Promoted to front page
                    [#default_value] => 1
                )

            [sticky] => Array
                (
                    [#type] => checkbox
                    [#title] => Sticky at top of lists
                    [#default_value] => 0
                )

        )

    [actions] => Array
        (
            [#type] => actions
            [submit] => Array
                (
                    [#type] => submit
                    [#access] => 1
                    [#value] => Save
                    [#weight] => 5
                    [#submit] => Array
                        (
                            [0] => node_form_submit
                        )

                )

            [preview] => Array
                (
                    [#access] => 1
                    [#type] => submit
                    [#value] => Preview
                    [#weight] => 10
                    [#submit] => Array
                        (
                            [0] => node_form_build_preview
                        )

                )

        )

    [#validate] => Array
        (
            [0] => node_form_validate
        )

    [#submit] => Array
        (
        )

    [#parents] => Array
        (
        )

    [#entity] => stdClass Object
        (
            [uid] => 1
            [name] => admin
            [type] => star_trek_movies
            [language] => und
            [title] =>
            [status] => 1
            [promote] => 1
            [sticky] => 0
            [created] => 1493680701
            [revision] =>
            [comment] => 2
            [menu] => Array
                (
                    [link_title] =>
                    [mlid] => 0
                    [plid] => 0
                    [menu_name] => main-menu
                    [weight] => 0
                    [options] => Array
                        (
                        )

                    [module] => menu
                    [expanded] => 0
                    [hidden] => 0
                    [has_children] => 0
                    [customized] => 0
                    [parent_depth_limit] => 8
                )

        )

    [body] => Array
        (
            [#type] => container
            [#attributes] => Array
                (
                    [class] => Array
                        (
                            [0] => field-type-text-with-summary
                            [1] => field-name-body
                            [2] => field-widget-text-textarea-with-summary
                        )

                )

            [#weight] => -4
            [#tree] => 1
            [#language] => und
            [und] => Array
                (
                    [0] => Array
                        (
                            [#entity_type] => node
                            [#entity] => stdClass Object
                                (
                                    [uid] => 1
                                    [name] => admin
                                    [type] => star_trek_movies
                                    [language] => und
                                    [title] =>
                                    [status] => 1
                                    [promote] => 1
                                    [sticky] => 0
                                    [created] => 1493680701
                                    [revision] =>
                                    [comment] => 2
                                    [menu] => Array
                                        (
                                            [link_title] =>
                                            [mlid] => 0
                                            [plid] => 0
                                            [menu_name] => main-menu
                                            [weight] => 0
                                            [options] => Array
                                                (
                                                )

                                            [module] => menu
                                            [expanded] => 0
                                            [hidden] => 0
                                            [has_children] => 0
                                            [customized] => 0
                                            [parent_depth_limit] => 8
                                        )

                                )

                            [#bundle] => star_trek_movies
                            [#field_name] => body
                            [#language] => und
                            [#field_parents] => Array
                                (
                                )

                            [#columns] => Array
                                (
                                    [0] => value
                                    [1] => summary
                                    [2] => format
                                )

                            [#title] => Body
                            [#description] =>
                            [#required] =>
                            [#delta] => 0
                            [#weight] => 0
                            [#type] => text_format
                            [#default_value] =>
                            [#rows] => 20
                            [#attributes] => Array
                                (
                                    [class] => Array
                                        (
                                            [0] => text-full
                                        )

                                )

                            [#format] =>
                            [#base_type] => textarea
                            [summary] => Array
                                (
                                    [#type] => textarea
                                    [#default_value] =>
                                    [#title] => Summary
                                    [#rows] => 5
                                    [#description] => Leave blank to use trimmed value of full text as the summary.
                                    [#attached] => Array
                                        (
                                            [js] => Array
                                                (
                                                    [0] => modules/field/modules/text/text.js
                                                )

                                        )

                                    [#attributes] => Array
                                        (
                                            [class] => Array
                                                (
                                                    [0] => text-summary
                                                )

                                        )

                                    [#prefix] =>

                                    [#suffix] =>

                                    [#weight] => -10
                                )

                        )

                    [#theme] => field_multiple_value_form
                    [#field_name] => body
                    [#cardinality] => 1
                    [#title] => Body
                    [#required] =>
                    [#description] =>
                    [#prefix] =>

                    [#suffix] =>

                    [#max_delta] => 0
                    [#after_build] => Array
                        (
                            [0] => field_form_element_after_build
                        )

                    [#language] => und
                    [#field_parents] => Array
                        (
                        )

                )

            [#access] => 1
        )

    [#pre_render] => Array
        (
            [0] => _field_extra_fields_pre_render
        )

    [#entity_type] => node
    [#bundle] => star_trek_movies
    [#form_id] => star_trek_movies_node_form
    [#type] => form
    [#build_id] => form-EAjg3DWoq9ZXMeHxC7emXgrpyJlyF_YMbT657Nh1sWo
    [form_build_id] => Array
        (
            [#type] => hidden
            [#value] => form-EAjg3DWoq9ZXMeHxC7emXgrpyJlyF_YMbT657Nh1sWo
            [#id] => form-EAjg3DWoq9ZXMeHxC7emXgrpyJlyF_YMbT657Nh1sWo
            [#name] => form_build_id
            [#parents] => Array
                (
                    [0] => form_build_id
                )

        )

    [#token] => star_trek_movies_node_form
    [form_token] => Array
        (
            [#id] => edit-star-trek-movies-node-form-form-token
            [#type] => token
            [#default_value] => vgOOCQoJnEDEDesVuRULC9fSdH1VoNSZ_ysHwFgZo-A
            [#parents] => Array
                (
                    [0] => form_token
                )

        )

    [form_id] => Array
        (
            [#type] => hidden
            [#value] => star_trek_movies_node_form
            [#id] => edit-star-trek-movies-node-form
            [#parents] => Array
                (
                    [0] => form_id
                )

        )

    [#id] => star-trek-movies-node-form
    [#method] => post
    [#action] => /node/add/star-trek-movies?render=overlay
    [#theme_wrappers] => Array
        (
            [0] => form
        )

    [#tree] =>
    [#theme] => Array
        (
            [0] => star_trek_movies_node_form
            [1] => node_form
        )

    [comment_settings] => Array
        (
            [#type] => fieldset
            [#access] => 0
            [#title] => Comment settings
            [#collapsible] => 1
            [#collapsed] => 1
            [#group] => additional_settings
            [#attributes] => Array
                (
                    [class] => Array
                        (
                            [0] => comment-node-settings-form
                        )

                )

            [#attached] => Array
                (
                    [js] => Array
                        (
                            [0] => modules/comment/comment-node-form.js
                        )

                )

            [#weight] => 30
            [comment] => Array
                (
                    [#type] => radios
                    [#title] => Comments
                    [#title_display] => invisible
                    [#parents] => Array
                        (
                            [0] => comment
                        )

                    [#default_value] => 2
                    [#options] => Array
                        (
                            [2] => Open
                            [1] => Closed
                            [0] => Hidden
                        )

                    [2] => Array
                        (
                            [#description] => Users with the "Post comments" permission can post comments.
                        )

                    [1] => Array
                        (
                            [#description] => Users cannot post comments.
                        )

                    [0] => Array
                        (
                            [#description] => Comments are hidden from view.
                            [#access] =>
                        )

                )

        )

)
